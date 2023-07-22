import { objectType } from 'nexus';
import { z } from 'zod';

export const LoginResultSuccessType = objectType({
  name: 'LoginResultSuccess',
  definition(t) {
    t.string('token');

    t.id('userId');
  },
});
