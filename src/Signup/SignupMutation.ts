import { pbkdf2Sync, randomBytes } from 'crypto';
import { mutationField, stringArg } from 'nexus';
import { signToken } from '../lib/TokenSchema';
import {
  AnonymousUserSchema,
  KnownUserSchema,
  mergeAnonymousUser,
} from '../User/UserSchema';

export const SignupMutation = mutationField('signup', {
  type: 'LoginResult',
  args: {
    email: stringArg(),
    password: stringArg(),
  },
  authorize: (_root, _args, { token }) => {
    return token?.anonymous === true;
  },
  resolve: async (_, { email, password }, { sql, token }) => {
    if (!token) {
      throw new Error('No token');
    }

    const user = await sql.begin(async (sql) => {
      const [anonUserRow] = await sql`
      SELECT id, email, password_hash, password_salt
      FROM "user"
      WHERE id = ${token.userId}
        AND email IS NULL
    `;

      if (!anonUserRow) {
        throw new Error('exipired account');
      }

      const anonUser = AnonymousUserSchema.parse(anonUserRow);

      const password_salt = randomBytes(16).toString('hex');
      const password_hash = pbkdf2Sync(
        password,
        password_salt,
        1000,
        64,
        `sha512`,
      ).toString(`hex`);

      const [userRow] = await sql`
        INSERT INTO "user"
        ${sql({ email, password_hash, password_salt })}
        RETURNING *
      `;

      const user = KnownUserSchema.parse(userRow);

      await mergeAnonymousUser(sql, user, anonUser);

      return user;
    });

    return {
      userId: user.id,
      token: signToken(user),
    };
  },
});
