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
      resolve: ({ description }) => {
        return description ?? '';
      },
    });

    t.string('directions', {
      resolve: ({ directions }) => {
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
        const userDescription = description ?? '';
        const ingredientsDescription =
          await loaders.recipeFallbackDescriptionById.load(recipe_id);
        if (userDescription && ingredientsDescription?.description) {
          return `${userDescription} — ${ingredientsDescription.description}`;
        }
        return userDescription || ingredientsDescription?.description || '';
      },
    });

    t.field('uri', {
      type: 'String',
      resolve: ({ id, user_id }) => {
        return `/${user_id}/recipe/${id}`;
      },
    });
  },
});
