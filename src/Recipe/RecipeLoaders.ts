import DataLoader from 'dataloader';
import { ID } from '../lib/ID';
import { Recipe, ZRecipe } from './Recipe';
import { ScopedDataLoaders, zParseById } from '../lib/ScopedDataLoaders';

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

  return { recipeById };
});
