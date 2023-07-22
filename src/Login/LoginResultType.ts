import { objectType, unionType } from 'nexus';

export const LoginResultTypeInterface = unionType({
  name: 'LoginResult',
  definition(t) {
    t.members('LoginResultFailure', 'LoginResultSuccess');
  },
  resolveType: (result) => {
    if ('token' in result) {
      return 'LoginResultSuccess';
    }
    return 'LoginResultFailure';
  },
});
