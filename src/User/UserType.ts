import { idArg, list, nullable, objectType } from 'nexus';
import { join } from 'path';

export const UserType = objectType({
  name: 'User',
  sourceType: {
    module: join(__dirname, 'UserSchema.ts'),
    export: 'User',
  },
  definition(t) {
    t.id('id');

    t.nullable.string('email');

    t.field('ingredientById', {
      type: nullable('Ingredient'),
      args: {
        ingredientId: idArg(),
      },
      resolve: async (_user, { ingredientId }, { loaders }) => {
        return loaders.ingredientById.load(ingredientId);
      },
    });

    t.field('ingredients', {
      type: list('Ingredient'),
      resolve: async ({ id: userId }, _args, { loaders }) => {
        return loaders.ingredientsByUserId.load(userId);
      },
    });

    t.field('recipeById', {
      type: nullable('Recipe'),
      args: {
        recipeId: idArg(),
      },
      resolve: async (_user, { recipeId }, { loaders }) => {
        return loaders.recipeById.load(recipeId);
      },
    });

    t.field('recipes', {
      type: list('Recipe'),
      resolve: async ({ id: userId }, _args, { loaders }) => {
        return loaders.recipesByUserId.load(userId);
      },
    });

    // t.field("updates", {
    //   type:
    // })
  },
});
