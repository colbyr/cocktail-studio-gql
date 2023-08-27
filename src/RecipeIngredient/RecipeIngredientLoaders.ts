import DataLoader from 'dataloader';
import { ScopedDataLoaders, zParseGroupById } from '../lib/ScopedDataLoaders';
import { RecipeIngredient, ZRecipeIngredient } from './RecipeIngredient';
import { ID } from '../lib/ID';

export const RecipeIngredientLoaders = new ScopedDataLoaders(
  ({ sql, userId }) => {
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
            ORDER BY amount_unit DESC
          `,
        });
      },
    );

    return { recipeIngredientsByRecipeId };
  },
);
