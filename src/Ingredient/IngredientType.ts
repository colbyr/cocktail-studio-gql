import { list, objectType } from 'nexus';
import { join } from 'path';

export const IngredientType = objectType({
  name: 'Ingredient',
  sourceType: {
    module: join(__dirname, './Ingredient.ts'),
    export: 'Ingredient',
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
      resolve: async ({ id: ingredientId }, _args, { loaders }) => {
        return loaders.recipeIngredientsByIngredientId.load(ingredientId);
      },
    });

    t.field('recipes', {
      type: list('Recipe'),
      resolve: async ({ id }, _args, { loaders }) => {
        return loaders.recipesByIngredientId.load(id);
      },
    });

    t.string('summary', {
      resolve: async (
        { id: ingredientId, description, user_id },
        _args,
        { loaders },
      ) => {
        const ingredientCount = await loaders.recipesCountByIngredientId.load(
          ingredientId,
        );
        const count = ingredientCount?.recipes_count ?? 0;
        const countStr = count === 1 ? `${count} recipe` : `${count} recipes`;
        if (description) {
          return `${description} — ${countStr}`;
        }
        return countStr;
      },
    });

    t.field('uri', {
      type: 'String',
      resolve: ({ id, user_id }) => {
        return `/${user_id}/ingredient/${id}`;
      },
    });
  },
});
