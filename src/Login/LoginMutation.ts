import { pbkdf2Sync } from 'crypto';
import { mutationField, stringArg } from 'nexus';
import { signToken } from '../lib/TokenSchema';
import {
  AnonymousUserSchema,
  KnownUserSchema,
  mergeAnonymousUser,
} from '../User/UserSchema';

export const LoginMutation = mutationField('login', {
  type: 'LoginResult',
  args: {
    email: stringArg(),
    password: stringArg(),
  },
  authorize: (_root, _args, { token }) => {
    if (!token) {
      return true;
    }
    return token.anonymous === true;
  },
  resolve: async (_, { email, password }, { sql, token }) => {
    const [[anonUserRow], [userRow]] = await Promise.all([
      token
        ? sql`
          SELECT id, email, password_hash, password_salt
          FROM "user"
          WHERE id = ${token.userId}
            AND email IS NULL
        `
        : [null],
      sql`
        SELECT id, email, password_hash, password_salt
        FROM "user"
        WHERE email = ${email}
      `,
    ]);

    if (!userRow || !userRow.password_hash || !userRow.password_salt) {
      return {
        reason: 'Incorrect email + password',
      };
    }

    const inputPasswordHash = pbkdf2Sync(
      password,
      userRow.password_salt,
      1000,
      64,
      `sha512`,
    ).toString(`hex`);

    if (inputPasswordHash !== userRow.password_hash) {
      return {
        reason: 'Incorrect email + password',
      };
    }

    const user = KnownUserSchema.parse(userRow);
    const anonUser = anonUserRow
      ? AnonymousUserSchema.parse(anonUserRow)
      : null;

    if (anonUser) {
      await mergeAnonymousUser(sql, user, anonUser);
    }

    return {
      userId: user.id,
      token: signToken(user),
    };
  },
});
