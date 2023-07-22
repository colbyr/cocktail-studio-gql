import { queryField } from 'nexus';
import { z } from 'zod';

export const MeQueryField = queryField('me', {
  type: 'User',
  resolve: async (_, _args, { sql, userId }) => {
    const result = await sql`
      SELECT id, email
      FROM "user"
      WHERE id = ${userId}
    `;
    return z
      .object({
        id: z.string(),
        email: z.string(),
      })
      .parse(result[0]);
  },
});
