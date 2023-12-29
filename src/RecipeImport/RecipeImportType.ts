import { list, objectType } from 'nexus';

export const RecipeImportType = objectType({
  name: 'RecipeImport',
  definition(t) {
    t.string('name');
    t.nullable.string('description');
    t.nullable.string('directions');
    t.field('recipeIngredients', {
      type: list(
        objectType({
          name: 'RecipeImportIngredient',
          definition(t) {
            t.float('amount');
            t.field({
              name: 'amountScale',
              type: 'AmountScale',
            });
            t.string('ingredientName');
          },
        }),
      ),
    });
  },
});
