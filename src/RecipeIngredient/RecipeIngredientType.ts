import { nullable, objectType } from 'nexus';
import { join } from 'path';

export const RecipeIngredientType = objectType({
  name: 'RecipeIngredient',
  sourceType: {
    module: join(__dirname, './RecipeIngredient.ts'),
    export: 'RecipeIngredient',
  },
  definition(t) {
    t.id('id');

    t.float('amount');

    t.field('amountScale', {
      type: nullable('AmountScale'),
      resolve: async ({ amount_scale }) => {
        return amount_scale;
      },
    });

    t.field('ingredient', {
      type: 'Ingredient',
      resolve: async ({ id, ingredient_id, user_id }, _args, { loaders }) => {
        const ingredient = await loaders.ingredientById.load(ingredient_id);
        if (!ingredient) {
          throw new Error(
            `RecipeIngredient(${id}) missing Ingredient(${ingredient_id})`,
          );
        }
        return ingredient;
      },
    });
  },
});
