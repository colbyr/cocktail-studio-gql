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
  const recipeById = new DataLoader<ID, Recipe | null | undefined>(
    async (recipeIds) => {
      return zParseById({
        ZType: ZRecipe.nullish(),
        requestedIds: recipeIds,
        rows: await sql`
        SELECT *
        FROM recipe
        WHERE user_id = ${userId}
          AND id IN ${sql(recipeIds)}
      `,
      });
    },
  );

  const recipeFallbackDescriptionById = new DataLoader<
    ID,
    { recipe_id: ID; description: string } | null | undefined
  >(async (recipeIds) => {
    const results = zParseById({
      ZType: z.object({ recipe_id: ZID, description: z.string() }).nullish(),
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

  return { recipeById, recipeFallbackDescriptionById, recipesByUserId };
});
