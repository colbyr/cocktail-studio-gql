import { Context } from '../Context';
import DataLoader from 'dataloader';
import { ID } from '../lib/ID';
import { Recipe } from './Recipe';
import { ScopedDataLoaders } from '../lib/ScopedDataLoaders';

export const RecipeLoaders = new ScopedDataLoaders((context) => {
  const recipeById = new DataLoader<ID, Recipe | null>(async (recipeIds) => {
    return recipeIds.map(() => null);
  });
  return { recipeById };
});
