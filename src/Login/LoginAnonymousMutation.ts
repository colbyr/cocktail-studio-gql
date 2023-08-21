import { mutationField, stringArg } from 'nexus';
import { signAnonymousToken } from '../lib/TokenSchema';
import { UserSchema } from '../User/UserSchema';

export const LoginAnonymousMutation = mutationField('loginAnonymous', {
  type: 'LoginResult',
  resolve: async (_root, _args, { sql }) => {
    const [userRow] = await sql`
      INSERT INTO "user" (email)
      VALUES (NULL)
      RETURNING id, email
    `;
    const user = UserSchema.parse(userRow);
    return {
      userId: user.id,
      token: signAnonymousToken(user),
    };
  },
});
