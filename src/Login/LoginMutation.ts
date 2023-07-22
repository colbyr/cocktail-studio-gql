import { mutationField, stringArg } from 'nexus';

export const LoginMutation = mutationField('login', {
  type: 'LoginResult',
  args: {
    email: stringArg(),
    password: stringArg(),
  },
  resolve: async () => {
    return {
      reason: 'Failed to login',
    };
  },
});
