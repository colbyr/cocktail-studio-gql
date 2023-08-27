import DataLoader from 'dataloader';
import { ID } from '../lib/ID';
import { Recipe, ZRecipe } from './Recipe';
import {
  ScopedDataLoaders,
  zParseById,
  zParseGroupById,
} from '../lib/ScopedDataLoaders';

export const RecipeLoaders = new ScopedDataLoaders(({ sql, userId }) => {
  const recipeById = new DataLoader<ID, Recipe | null>(async (recipeIds) => {
    return zParseById({
      ZType: ZRecipe,
      requestedIds: recipeIds,
      rows: await sql`
        SELECT *
        FROM recipe
        WHERE user_id = ${userId}
          AND id IN ${sql(recipeIds)}
      `,
    });
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

  return { recipeById, recipesByUserId };
});
