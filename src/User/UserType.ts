import { list, objectType } from 'nexus';
import { ZRecipe } from '../Recipe/Recipe';
import { z } from 'zod';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.id('id');

    t.string('email');

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
        console.info('testing');
        return z.array(ZRecipe).parse(result.rows);
      },
    });
  },
});
