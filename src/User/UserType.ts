import { idArg, list, nullable, objectType } from 'nexus';
import { join } from 'path';
import { ZRecipe } from '../Recipe/Recipe';
import { z } from 'zod';
import { ZIngredient } from '../Ingredient/Ingredient';

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
      resolve: async ({ id: userId }, _args, { sql }) => {
        const ingredientRows = await sql`
          SELECT *
          FROM ingredient
          WHERE user_id = ${userId}
        `;
        return z.array(ZIngredient).parse(ingredientRows);
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
      resolve: async ({ id: userId }, _args, { sql }) => {
        const recipeRows = await sql`
          SELECT *
          FROM recipe
          WHERE user_id = ${userId}
        `;
        return z.array(ZRecipe).parse(recipeRows);
      },
    });
  },
});
