import { idArg, list, nullable, objectType } from 'nexus';
import { ZRecipe } from '../Recipe/Recipe';
import { z } from 'zod';

export const UserType = objectType({
  name: 'User',
  definition(t) {
    t.id('id');

    t.string('email');

    t.field('recipeById', {
      type: nullable('Recipe'),
      args: {
        recipeId: idArg(),
      },
      resolve: async ({ id: userId }, { recipeId }, { sql }) => {
        const [recipe] = await sql`
          SELECT *
          FROM recipe
          WHERE user_id = ${userId}
            AND id = ${recipeId}
        `;
        if (!recipe) {
          return null;
        }
        return ZRecipe.parse(recipe);
      },
    });

    t.field('recipes', {
      type: list('Recipe'),
      resolve: async ({ id: userId }, _args, { sql }) => {
        const result = await sql`
          SELECT *
          FROM recipe
          WHERE user_id = ${userId}
        `;
        return z.array(ZRecipe).parse(result);
      },
    });
  },
});
