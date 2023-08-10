import { idArg, list, nullable, objectType } from 'nexus';
import { ZRecipe } from '../Recipe/Recipe';
import { z } from 'zod';
import { ZIngredient } from '../Ingredient/Ingredient';

export const UserType = objectType({
  name: 'User',
  definition(t) {
    t.id('id');

    t.string('email');

    t.field('ingredientById', {
      type: nullable('Ingredient'),
      args: {
        ingredientId: idArg(),
      },
      resolve: async ({ id: userId }, { ingredientId }, { sql }) => {
        const [ingredientRow] = await sql`
          SELECT *
          FROM ingredient
          WHERE user_id = ${userId}
            AND id = ${ingredientId}
        `;
        if (!ingredientRow) {
          return null;
        }
        return ZIngredient.parse(ingredientRow);
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
      resolve: async ({ id: userId }, { recipeId }, { sql }) => {
        const [recipeRow] = await sql`
          SELECT *
          FROM recipe
          WHERE user_id = ${userId}
            AND id = ${recipeId}
        `;
        if (!recipeRow) {
          return null;
        }
        return ZRecipe.parse(recipeRow);
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
