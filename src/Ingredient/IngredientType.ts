import { list, objectType } from 'nexus';
import { join } from 'path';
import { z } from 'zod';
import { ZRecipe } from '../Recipe/Recipe';

export const IngredientType = objectType({
  name: 'Ingredient',
  sourceType: {
    module: join(__dirname, './Ingredient.ts'),
    export: 'Ingredient',
  },
  definition(t) {
    t.id('id');

    t.string('description', {
      resolve: async ({ id, user_id }, _args, { sql }) => {
        const [ingredientCount] = await sql`
          SELECT ingredient_id, COUNT(*)
          FROM recipe_ingredient
          WHERE recipe_ingredient.user_id = ${user_id}
            AND recipe_ingredient.ingredient_id = ${id}
          GROUP BY ingredient_id
        `;
        const count = ingredientCount ? parseInt(ingredientCount.count) : 0;
        if (count === 1) {
          return `${count} recipe`;
        }
        return `${count} recipes`;
      },
    });

    t.string('name');

    t.field('recipes', {
      type: list('Recipe'),
      resolve: async ({ id }, _args, { loaders }) => {
        return loaders.recipesByIngredientId.load(id);
      },
    });
  },
});
