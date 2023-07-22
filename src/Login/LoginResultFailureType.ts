import { objectType } from 'nexus';

export const LoginResultFailureType = objectType({
  name: 'LoginResultFailure',
  definition(t) {
    t.string('reason');
  },
});
