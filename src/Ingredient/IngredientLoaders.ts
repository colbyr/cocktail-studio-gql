import { Context, context } from '../Context';
import DataLoader from 'dataloader';
import { ID } from '../lib/ID';
import { ScopedDataLoaders } from '../lib/ScopedDataLoaders';
import { Ingredient } from './Ingredient';

export const IngredientLoaders = new ScopedDataLoaders((context) => {
  const ingredientById = new DataLoader<ID, Ingredient | null>(
    async (recipeIds) => {
      return recipeIds.map(() => null);
    },
  );

  return { ingredientById };
});
