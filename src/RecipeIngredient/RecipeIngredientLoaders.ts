import DataLoader from 'dataloader';
import { ScopedDataLoaders, zParseGroupById } from '../lib/ScopedDataLoaders';
import { RecipeIngredient, ZRecipeIngredient } from './RecipeIngredient';
import { ID } from '../lib/ID';

export const RecipeIngredientLoaders = new ScopedDataLoaders(
  ({ sql, userId }) => {
    const recipeIngredientsByIngredientId = new DataLoader<
      ID,
      RecipeIngredient[]
    >(async (ingredientIds) => {
      return zParseGroupById({
        ZType: ZRecipeIngredient,
        requestedIds: ingredientIds,
        id: 'ingredient_id',
        rows: await sql`
          SELECT DISTINCT recipe_ingredient.*
          FROM recipe_ingredient
          WHERE user_id = ${userId}
            AND ingredient_id IN ${sql(ingredientIds)}
        `,
      });
    });

    const recipeIngredientsByRecipeId = new DataLoader<ID, RecipeIngredient[]>(
      async (recipeIds) => {
        return zParseGroupById({
          ZType: ZRecipeIngredient,
          requestedIds: recipeIds,
          id: 'recipe_id',
          rows: await sql`
            SELECT *
            FROM recipe_ingredient
            WHERE user_id = ${userId}
              AND recipe_id IN ${sql(recipeIds)}
            ORDER BY
              amount_scale DESC,
              amount_unit DESC
          `,
        });
      },
    );

    return { recipeIngredientsByIngredientId, recipeIngredientsByRecipeId };
  },
);
