import { pbkdf2Sync } from 'crypto';
import jwt from 'jsonwebtoken';
import { mutationField, stringArg } from 'nexus';
import { Env } from '../Env';
import { signToken } from '../lib/TokenSchema';
import { UserSchema } from '../User/UserSchema';

export const LoginMutation = mutationField('login', {
  type: 'LoginResult',
  authorize: (_root, _args, { token }) => {
    if (!token) {
      return true;
    }
    return (
      typeof token === 'object' &&
      'anonymous' in token &&
      token.anonymous === true
    );
  },
  args: {
    email: stringArg(),
    password: stringArg(),
  },
  resolve: async (_, { email, password }, { sql, token }) => {
    const [userRow] = await sql`
      SELECT id, email, password_hash, password_salt
      FROM "user"
      WHERE email = ${email}
    `;

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

    const user = UserSchema.parse(userRow);

    return {
      userId: user.id,
      token: signToken(user),
    };
  },
});
