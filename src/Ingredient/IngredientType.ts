import { objectType } from 'nexus';
import { join } from 'path';

export const IngredientType = objectType({
  name: 'Ingredient',
  sourceType: {
    module: join(__dirname, './Ingredient.ts'),
    export: 'Ingredient',
  },
  definition(t) {
    t.id('id');

    t.string('name');
  },
});
