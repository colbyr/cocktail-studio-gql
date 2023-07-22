import { objectType } from 'nexus';
import { z } from 'zod';

export const LoginResultSuccessType = objectType({
  name: 'LoginResultSuccess',
  definition(t) {
    t.string('token');

    t.id('userId');

    t.field('user', {
      type: 'User',
      resolve: async ({ userId }, _args, { sql }) => {
        const [userRow] = await sql`
          SELECT id, email
          FROM "user"
          WHERE id = ${userId}
        `;
        return z
          .object({
            id: z.string(),
            email: z.string(),
          })
          .parse(userRow);
      },
    });
  },
});
