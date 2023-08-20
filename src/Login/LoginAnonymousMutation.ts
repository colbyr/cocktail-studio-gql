import jwt from 'jsonwebtoken';
import { mutationField, stringArg } from 'nexus';
import { Env } from '../Env';

export const LoginAnonymousMutation = mutationField('loginAnonymous', {
  type: 'LoginResult',
  resolve: async (_root, _args, { sql }) => {
    const [userRow] = await sql`
      INSERT INTO "user" (email)
      VALUES (NULL)
      RETURNING id, email
    `;
    return {
      userId: userRow.id,
      token: jwt.sign(
        {
          anonymous: true,
          time: new Date(),
          userId: `${userRow.id}`,
        },
        Env.JWT_SECRET_KEY,
      ),
    };
  },
});
