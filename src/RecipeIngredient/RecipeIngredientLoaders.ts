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
        id: 'lookup_id',
        rows: await sql`
          WITH RECURSIVE related_ingredients AS (
            SELECT
              id as lookup_id,
              id as id
            FROM ingredient
            WHERE user_id = ${userId}
              AND id IN ${sql(ingredientIds)}

            UNION

            SELECT
              related_ingredients.lookup_id,
              ingredient.id
            FROM ingredient
            JOIN related_ingredients ON (ingredient.type_of_ingredient_id = related_ingredients.id)
          )

          SELECT DISTINCT
            related_ingredients.lookup_id,
            recipe_ingredient.*
          FROM recipe_ingredient
          JOIN related_ingredients ON (
            related_ingredients.id = recipe_ingredient.ingredient_id
          )
          JOIN recipe ON (
            recipe.user_id = recipe_ingredient.user_id
            AND recipe.id = recipe_ingredient.recipe_id
          )
          WHERE recipe.user_id = ${userId}
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
