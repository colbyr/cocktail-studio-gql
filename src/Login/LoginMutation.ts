import { pbkdf2Sync } from 'crypto';
import jwt from 'jsonwebtoken';
import { mutationField, stringArg } from 'nexus';
import { Env } from '../Env';

export const LoginMutation = mutationField('login', {
  type: 'LoginResult',
  args: {
    email: stringArg(),
    password: stringArg(),
  },
  resolve: async (_, { email, password }, { sql }) => {
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
    return {
      userId: userRow.id,
      token: jwt.sign(
        { time: new Date(), userId: `${userRow.id}` },
        Env.JWT_SECRET_KEY,
      ),
    };
  },
});
