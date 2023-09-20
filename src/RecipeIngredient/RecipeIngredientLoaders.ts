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
          SELECT *
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
