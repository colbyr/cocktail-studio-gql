import { queryField } from 'nexus';
import { z } from 'zod';
import { requireAuth } from '../lib/Authorize';

export const MeQueryField = queryField('me', {
  type: 'User',
  authorize: requireAuth,
  resolve: async (_, _args, { sql, userId }) => {
    const result = await sql`
      SELECT id, email
      FROM "user"
      WHERE id = ${userId}
    `;
    return z
      .object({
        id: z.string(),
        email: z.string().nullable(),
      })
      .parse(result[0]);
  },
});
