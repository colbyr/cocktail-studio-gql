import { list, objectType } from 'nexus';
import { join } from 'path';
import { z } from 'zod';
import { ZRecipeIngredient } from '../RecipeIngredient/RecipeIngredient';

export const RecipeType = objectType({
  name: 'Recipe',
  sourceType: {
    module: join(__dirname, './Recipe.ts'),
    export: 'Recipe',
  },
  definition(t) {
    t.id('id');

    t.nullable.string('description');

    t.field('recipeIngredients', {
      type: list('RecipeIngredient'),
      resolve: async ({ id: recipeId, user_id }, _args, { sql }) => {
        const result = await sql`
          SELECT *
          FROM recipe_ingredient
          WHERE user_id = ${user_id}
            AND recipe_id = ${recipeId}
        `;
        return z.array(ZRecipeIngredient).parse(result);
      },
    });

    t.string('name');
  },
});
