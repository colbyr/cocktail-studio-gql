import { list, objectType } from 'nexus';

export const IndexUpdateType = objectType({
  name: 'IndexUpdate',
  definition(t) {
    t.field('deleted', {
      type: list('Recipe'),
      resolve: async () => {
        return [];
      },
    });

    t.field('updated', {
      type: list('Recipe'),
      resolve: async () => {
        return [];
      },
    });
  },
});
