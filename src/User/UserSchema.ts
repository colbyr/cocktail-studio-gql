import { Sql } from 'postgres';
import { z } from 'zod';

export const AnonymousUserSchema = z.object({
  id: z.coerce.string(),
  email: z.null(),
});

export type AnonymousUser = z.infer<typeof AnonymousUserSchema>;

export const KnownUserSchema = z.object({
  id: z.coerce.string(),
  email: z.string(),
});

export type KnownUser = z.infer<typeof KnownUserSchema>;

export const UserSchema = z.union([AnonymousUserSchema, KnownUserSchema]);

export type User = z.infer<typeof UserSchema>;

export async function mergeAnonymousUser(
  sql: Sql,
  user: User,
  anonUser: AnonymousUser,
) {
  const tablesToMerge = ['ingredient', 'recipe', 'recipe_ingredient'];
  await Promise.all(
    tablesToMerge.map(async (tableName) => {
      await sql`
        UPDATE ${sql(tableName)} SET user_id = ${user.id}
        FROM "user"
        WHERE ${sql(tableName)}.user_id = ${anonUser.id}
          AND "user".id = ${sql(tableName)}.user_id
          AND "user".email IS NULL
      `;
    }),
  );
  await sql`
    DELETE FROM "user"
    WHERE id = ${anonUser.id}
      AND email IS NULL
  `;
}
