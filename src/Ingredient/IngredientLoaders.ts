import DataLoader from 'dataloader';
import { ID } from '../lib/ID';
import {
  ScopedDataLoaders,
  zParseById,
  zParseGroupById,
} from '../lib/ScopedDataLoaders';
import { Ingredient, ZIngredient } from './Ingredient';

export const IngredientLoaders = new ScopedDataLoaders(({ sql, userId }) => {
  const ingredientById = new DataLoader<ID, Ingredient | null>(
    async (ingredientIds) => {
      return zParseById({
        ZType: ZIngredient.nullable(),
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

  const ingredientByTypeOfId = new DataLoader<ID, Ingredient[]>(
    async (ingredientIds) => {
      return zParseGroupById({
        id: 'lookup_ingredient_id',
        ZType: ZIngredient,
        requestedIds: ingredientIds,
        rows: await sql`
          WITH RECURSIVE all_ingredient_types AS (
            SELECT
              ingredient.type_of_ingredient_id as lookup_ingredient_id,
              ingredient.id,
              ingredient.user_id
            FROM ingredient
            WHERE user_id = ${userId}
              AND type_of_ingredient_id IN (${sql(ingredientIds)})

            UNION

            SELECT
              all_ingredient_types.lookup_ingredient_id,
              ingredient.id,
              all_ingredient_types.user_id
            FROM ingredient
            INNER JOIN all_ingredient_types ON (
              all_ingredient_types.user_id = ingredient.user_id
              AND ingredient.type_of_ingredient_id = all_ingredient_types.id
            )
          )

          SELECT
            all_ingredient_types.lookup_ingredient_id,
            ingredient.*
          FROM all_ingredient_types
          JOIN ingredient ON (
            ingredient.user_id = all_ingredient_types.user_id
            AND ingredient.id = all_ingredient_types.id
          )
          ORDER BY ingredient.name ASC, type_of_ingredient_id
        `,
      });
    },
  );

  const ingredientsByUserId = new DataLoader<ID, Ingredient[]>(
    async (userIds) => {
      if (userIds.some((id) => id !== userId)) {
        throw new Error(
          `User(${userId}) cannot query data for Users(${userIds})`,
        );
      }
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

  return { ingredientById, ingredientByTypeOfId, ingredientsByUserId };
});
