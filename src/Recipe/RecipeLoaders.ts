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
        SELECT
          recipe_ingredient.ingredient_id,
          COUNT(DISTINCT recipe_ingredient.recipe_id) as recipes_count
        FROM recipe_ingredient
        WHERE recipe_ingredient.user_id = ${userId}
          AND recipe_ingredient.ingredient_id IN ${sql(ingredientIds)}
        GROUP BY recipe_ingredient.ingredient_id
      `,
    });
    return results;
  });

  const recipesByUserId = new DataLoader<ID, Recipe[]>(async (userIds) => {
    const results = zParseGroupById({
      ZType: ZRecipe,
      requestedIds: userIds,
      id: 'user_id',
      rows: await sql`
        SELECT *
        FROM recipe
        WHERE user_id IN ${sql(userIds)}
      `,
    });
    for (const group of results) {
      for (const ingredient of group) {
        recipeById.prime(ingredient.id, ingredient);
      }
    }
    return results;
  });

  return {
    recipeById,
    recipeFallbackDescriptionById,
    recipesByIngredientId,
    recipesCountByIngredientId,
    recipesByUserId,
  };
});
