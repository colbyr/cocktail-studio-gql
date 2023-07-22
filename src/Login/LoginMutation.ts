import { pbkdf2Sync } from 'crypto';
import { mutationField, stringArg } from 'nexus';

export const LoginMutation = mutationField('login', {
  type: 'LoginResult',
  args: {
    email: stringArg(),
    password: stringArg(),
  },
  resolve: async (_, { email, password }, { sql }) => {
    const [user] = await sql`
      SELECT id, password_hash, password_salt
      FROM "user"
      WHERE email = ${email}
    `;

    if (!user || !user.password_hash || !user.password_salt) {
      return {
        reason: 'Incorrect email + password',
      };
    }

    const inputPasswordHash = pbkdf2Sync(
      password,
      user.password_salt,
      1000,
      64,
      `sha512`,
    ).toString(`hex`);

    if (inputPasswordHash !== user.password_hash) {
      return {
        reason: 'Incorrect email + password',
      };
    }

    return {
      token: 'fake-token',
    };
  },
});
