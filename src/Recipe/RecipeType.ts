import { list, objectType } from 'nexus';
import { join } from 'path';

export const RecipeType = objectType({
  name: 'Recipe',
  sourceType: {
    module: join(__dirname, './Recipe.ts'),
    export: 'Recipe',
  },
  definition(t) {
    t.id('id');

    t.string('description', {
      resolve: async (
        { description, id: recipe_id, user_id },
        _args,
        { loaders, sql },
      ) => {
        return description ?? '';
      },
    });

    t.string('directions', {
      resolve: async ({ directions }) => {
        return directions ?? '';
      },
    });

    t.string('name');

    t.field('recipeIngredients', {
      type: list('RecipeIngredient'),
      resolve: async ({ id: recipeId }, _args, { loaders }) => {
        return loaders.recipeIngredientsByRecipeId.load(recipeId);
      },
    });

    t.field('summary', {
      type: 'String',
      resolve: async (
        { description, id: recipe_id, user_id },
        _args,
        { loaders, sql },
      ) => {
        if (description) {
          return description;
        }
        const fallbackDescription =
          await loaders.recipeFallbackDescriptionById.load(recipe_id);
        return fallbackDescription?.description ?? '';
      },
    });
  },
});
