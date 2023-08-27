import DataLoader from 'dataloader';
import { ID } from '../lib/ID';
import { ScopedDataLoaders, zParseById } from '../lib/ScopedDataLoaders';
import { Ingredient, ZIngredient } from './Ingredient';

export const IngredientLoaders = new ScopedDataLoaders(({ sql, userId }) => {
  const ingredientById = new DataLoader<ID, Ingredient | null>(
    async (ingredientIds) => {
      return zParseById({
        ZType: ZIngredient,
        requestedIds: ingredientIds,
        rows: await sql`
          SELECT *
          FROM ingredient
          WHERE user_id = ${userId}
            AND id IN ${sql(ingredientIds)}
        `,
      });
    },
  );

  return { ingredientById };
});
