import DataLoader from 'dataloader';
import { ID } from '../lib/ID';
import {
  ScopedDataLoaders,
  zParseById,
  zParseGroupById,
} from '../lib/ScopedDataLoaders';
import { Ingredient, ZIngredient } from './Ingredient';

export const IngredientLoaders = new ScopedDataLoaders(({ sql, userId }) => {
  const ingredientById = new DataLoader<ID, Ingredient | null | undefined>(
    async (ingredientIds) => {
      return zParseById({
        ZType: ZIngredient.nullish(),
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

  const ingredientsByUserId = new DataLoader<ID, Ingredient[]>(
    async (userIds) => {
      const results = zParseGroupById({
        ZType: ZIngredient,
        requestedIds: userIds,
        id: 'user_id',
        rows: await sql`
          SELECT *
          FROM ingredient
          WHERE user_id IN ${sql(userIds)}
        `,
      });
      for (const group of results) {
        for (const ingredient of group) {
          ingredientById.prime(ingredient.id, ingredient);
        }
      }
      return results;
    },
  );

  return { ingredientById, ingredientsByUserId };
});
