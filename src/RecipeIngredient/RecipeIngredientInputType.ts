import { inputObjectType, nullable } from 'nexus';

export const RecipeIngredientInputType = inputObjectType({
  name: 'RecipeIngredientInput',
  definition(t) {
    t.float('amount');

    t.field({
      name: 'amountScale',
      type: 'AmountScale',
    });

    t.string('ingredientName');
  },
});
