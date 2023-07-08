import { idArg, list, nullable, objectType } from 'nexus';
import { ZRecipe } from '../Recipe/Recipe';
import { z } from 'zod';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.id('id');

    t.string('email');

    t.field('recipeById', {
      type: nullable('Recipe'),
      args: {
        recipeId: idArg(),
      },
      resolve: async ({ id: userId }, { recipeId }, { pool }) => {
        const result = await pool.query(
          `
          SELECT *
          FROM recipe
          WHERE user_id = $1
            AND id = $2
          `,
          [userId, recipeId],
        );
        return ZRecipe.parse(result.rows[0]);
      },
    });

    t.field('recipes', {
      type: list('Recipe'),
      resolve: async ({ id: userId }, _args, { pool }) => {
        const result = await pool.query(
          `
          SELECT *
          FROM recipe
          WHERE user_id = $1
          `,
          [userId],
        );
        return z.array(ZRecipe).parse(result.rows);
      },
    });
  },
});
