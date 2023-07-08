import { objectType } from 'nexus';
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
      type: 'AmountScale',
      resolve: async ({ amount_scale }) => {
        return amount_scale;
      },
    });
  },
});
