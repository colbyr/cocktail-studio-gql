import DataLoader from 'dataloader';
import { ID, ZID } from '../lib/ID';
import { Recipe, ZRecipe } from './Recipe';
import {
  ScopedDataLoaders,
  zParseById,
  zParseGroupById,
} from '../lib/ScopedDataLoaders';
import { z } from 'zod';

export const RecipeLoaders = new ScopedDataLoaders(({ sql, userId }) => {
  const recipeById = new DataLoader<ID, Recipe | null>(async (recipeIds) => {
    return zParseById({
      ZType: ZRecipe.nullable(),
      requestedIds: recipeIds,
      rows: await sql`
        SELECT *
        FROM recipe
        WHERE user_id = ${userId}
          AND id IN ${sql(recipeIds)}
      `,
    });
  });

  const recipeFallbackDescriptionById = new DataLoader<
    ID,
    { recipe_id: ID; description: string } | null
  >(async (recipeIds) => {
    const results = zParseById({
      ZType: z.object({ recipe_id: ZID, description: z.string() }).nullable(),
      requestedIds: recipeIds,
      id: 'recipe_id',
      rows: await sql`
        SELECT
          recipe_ingredient.recipe_id,
          STRING_AGG(
            ingredient.name,
            ', ' ORDER BY amount_scale DESC, amount_unit DESC
          ) as description
        FROM recipe_ingredient
        JOIN ingredient ON (
          ingredient.user_id = recipe_ingredient.user_id
          AND ingredient.id = recipe_ingredient.ingredient_id
        )
        WHERE recipe_ingredient.user_id = ${userId}
          AND recipe_ingredient.recipe_id IN ${sql(recipeIds)}
        GROUP BY recipe_ingredient.recipe_id
      `,
    });
    return results;
  });

  const recipesByIngredientId = new DataLoader<ID, Recipe[]>(
    async (ingredientIds) => {
      const results = zParseGroupById({
        ZType: ZRecipe,
        requestedIds: ingredientIds,
        id: 'ingredient_id',
        rows: await sql`
          SELECT DISTINCT recipe_ingredient.ingredient_id, recipe.*
          FROM recipe_ingredient
          JOIN recipe ON (
            recipe.user_id = recipe_ingredient.user_id
            AND recipe.id = recipe_ingredient.recipe_id
          )
          WHERE recipe_ingredient.user_id = ${userId}
            AND recipe_ingredient.ingredient_id IN ${sql(ingredientIds)}
            AND recipe.deleted_at IS NULL
        `,
      });
      for (const group of results) {
        for (const recipe of group) {
          recipeById.prime(recipe.id, recipe);
        }
      }
      return results;
    },
  );

  const recipesCountByIngredientId = new DataLoader<
    ID,
    { ingredient_id: ID; recipes_count: number } | null
  >(async (ingredientIds) => {
    const results = zParseById({
      ZType: z
        .object({
          ingredient_id: ZID,
          recipes_count: z.coerce.number(),
        })
        .nullable(),
      requestedIds: ingredientIds,
      id: 'ingredient_id',
      rows: await sql`
        WITH RECURSIVE related_ingredients AS (
          SELECT
            id as lookup_id,
            id as id,
            user_id
          FROM ingredient
          WHERE user_id = ${userId}
            AND id IN ${sql(ingredientIds)}
          UNION
          SELECT
            related_ingredients.lookup_id,
            ingredient.id,
            ingredient.user_id
          FROM ingredient
          JOIN related_ingredients ON (
            related_ingredients.user_id = ingredient.user_id
            AND related_ingredients.id = ingredient.type_of_ingredient_id
          )
          WHERE ingreient.deleted_at IS NULL
        )

        SELECT
          related_ingredients.lookup_id as ingredient_id,
          COUNT(*) as recipes_count
        FROM related_ingredients
        JOIN recipe_ingredient ON (
          recipe_ingredient.user_id = related_ingredients.user_id
          AND recipe_ingredient.ingredient_id = related_ingredients.id
        )
        JOIN recipe ON (
          recipe.user_id = recipe_ingredient.user_id
          AND recipe.id = recipe_ingredient.recipe_id
        )
        WHERE recipe.deleted_at IS NULL
        GROUP BY related_ingredients.lookup_id
      `,
    });
    return results;
  });

  const recipesByUserId = new DataLoader<ID, Recipe[]>(async (userIds) => {
    if (userIds.some((id) => id !== userId)) {
      throw new Error(
        `User(${userId}) cannot query data for Users(${userIds})`,
      );
    }
    const results = zParseGroupById({
      ZType: ZRecipe,
      requestedIds: userIds,
      id: 'user_id',
      rows: await sql`
        SELECT *
        FROM recipe
        WHERE user_id IN ${sql(userIds)}
          AND recipe.deleted_at IS NULL
      `,
    });
    for (const group of results) {
      for (const ingredient of group) {
        recipeById.prime(ingredient.id, ingredient);
      }
    }
    return results;
  });

  const recipesDeletedSince = new DataLoader<
    { userId: ID; since: Date },
    Recipe[]
  >(
    async (keys) => {
      if (keys.length > 1) {
        throw new Error('this loader only supports one key at a time');
      }
      const [{ userId: queryUserId, since }] = keys;
      if (queryUserId !== userId) {
        throw new Error(
          `User(${userId}) cannot query data for Users(${queryUserId})`,
        );
      }

      const rows = await sql`
        SELECT *
        FROM recipe
        WHERE user_id = ${queryUserId}
          AND deleted_at IS NOT NULL
          AND deleted_at > ${since.toISOString()}
      `;
      const recipes = z.array(ZRecipe).parse(rows);
      for (const recipe of recipes) {
        recipeById.prime(recipe.id, recipe);
      }
      return [recipes];
    },
    { maxBatchSize: 1 },
  );

  const recipesUpdatedSince = new DataLoader<
    { userId: ID; since: Date },
    Recipe[]
  >(
    async (keys) => {
      if (keys.length > 1) {
        throw new Error('this loader only supports one key at a time');
      }
      const [{ userId: queryUserId, since }] = keys;
      if (queryUserId !== userId) {
        throw new Error(
          `User(${userId}) cannot query data for Users(${queryUserId})`,
        );
      }
      const rows = await sql`
        SELECT *
        FROM recipe
        WHERE user_id = ${queryUserId}
          AND updated_at > ${since.toISOString()}
          AND deleted_at IS NULL
      `;
      const recipes = z.array(ZRecipe).parse(rows);
      for (const recipe of recipes) {
        recipeById.prime(recipe.id, recipe);
      }
      return [recipes];
    },
    { maxBatchSize: 1 },
  );

  return {
    recipeById,
    recipeFallbackDescriptionById,
    recipesByIngredientId,
    recipesCountByIngredientId,
    recipesByUserId,
    recipesDeletedSince,
    recipesUpdatedSince,
  };
});
