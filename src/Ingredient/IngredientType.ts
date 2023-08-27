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
      resolve: async ({ id: ingredientId, user_id }, _args, { loaders }) => {
        const ingredientCount = await loaders.recipesCountByIngredientId.load(
          ingredientId,
        );
        const count = ingredientCount?.recipes_count ?? 0;
        if (count === 1) {
          return `${count} recipe`;
        }
        return `${count} recipes`;
      },
    });

    t.string('name');

    t.field('recipes', {
      type: list('Recipe'),
      resolve: async ({ id }, _args, { loaders }) => {
        return loaders.recipesByIngredientId.load(id);
      },
    });
  },
});
