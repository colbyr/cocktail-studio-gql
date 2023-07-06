import { objectType } from 'nexus';
import { join } from 'path';

export const RecipeType = objectType({
  name: 'Recipe',
  sourceType: {
    module: join(__dirname, './Recipe.ts'),
    export: 'Recipe',
  },
  definition(t) {
    t.id('id');

    t.string('name');

    t.nullable.string('description');
  },
});
