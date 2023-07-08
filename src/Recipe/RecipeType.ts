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
      resolve: async ({ id: recipeId, user_id }, _args, { pool }) => {
        const result = await pool.query(
          `
          SELECT *
          FROM recipe_ingredient
          WHERE user_id = $1
            AND recipe_id = $2
          `,
          [user_id, recipeId],
        );
        return z.array(ZRecipeIngredient).parse(result.rows);
      },
    });

    t.string('name');
  },
});
