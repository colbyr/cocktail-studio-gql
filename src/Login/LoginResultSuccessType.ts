import { objectType } from 'nexus';

export const LoginResultSuccessType = objectType({
  name: 'LoginResultSuccess',
  definition(t) {
    t.string('token');
  },
});
