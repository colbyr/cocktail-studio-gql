import { list, objectType } from 'nexus';
import { join } from 'path';
import { z } from 'zod';
import { ZRecipeIngredient } from '../RecipeIngredient/RecipeIngredient';
import { sortWith } from 'ramda';

export const RecipeType = objectType({
  name: 'Recipe',
  sourceType: {
    module: join(__dirname, './Recipe.ts'),
    export: 'Recipe',
  },
  definition(t) {
    t.id('id');

    t.string('description', {
      resolve: async (
        { description, id: recipe_id, user_id },
        _args,
        { sql },
      ) => {
        if (description) {
          return description;
        }
        const recipeIngredients = await sql`
          SELECT ingredient.name
          FROM recipe_ingredient
          JOIN ingredient ON (
            ingredient.user_id = recipe_ingredient.user_id
            AND ingredient.id = recipe_ingredient.ingredient_id
          )
          WHERE recipe_ingredient.user_id = ${user_id}
            AND recipe_ingredient.recipe_id = ${recipe_id}
          ORDER BY
            amount_scale DESC,
            amount_unit DESC
        `;
        return recipeIngredients.map(({ name }) => name).join(', ');
      },
    });

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
