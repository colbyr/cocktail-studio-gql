import { list, mutationField, stringArg } from 'nexus';
import { ZRecipe } from './Recipe';
import { indexBy } from 'ramda';
import { z } from 'zod';
import { requireAuth } from '../lib/Authorize';

export const CreateRecipeMutation = mutationField('createRecipe', {
  type: 'Recipe',
  authorize: requireAuth,
  args: {
    name: stringArg(),
    recipeIngredients: list('RecipeIngredientInput'),
  },
  resolve: async (_, { name, recipeIngredients }, { sql, userId }) => {
    return sql.begin(async (sql) => {
      const [recipe] = z.array(ZRecipe).parse(
        await sql`
          INSERT INTO recipe
          ${sql({ name, user_id: userId })}
          RETURNING *
        `,
      );
      if (recipeIngredients.length > 0) {
        await sql`
          INSERT INTO ingredient
          ${sql(
            recipeIngredients.map(({ ingredientName }) => ({
              name: ingredientName,
              user_id: userId,
            })),
          )}
          ON CONFLICT DO NOTHING
        `;
        const idx_ingredient_map = indexBy(
          ({ idx }) => idx,
          await sql`
            WITH new_ingredient AS (
              SELECT
                idx,
                tsvector_name(name) as name_vector
              FROM (VALUES ${sql(
                recipeIngredients.map(({ ingredientName }, idx) => [
                  idx,
                  ingredientName,
                ]),
              )}) as t(idx, name)
            )

            SELECT new_ingredient.idx, ingredient.id
            FROM new_ingredient
            JOIN ingredient ON (
              ingredient.user_id = ${userId}
              AND ingredient.name_vector = new_ingredient.name_vector
            )
          `,
        );
        await sql`
          INSERT INTO recipe_ingredient
          ${sql(
            recipeIngredients.map(({ amount, amountScale }, idx) => ({
              ingredient_id: idx_ingredient_map[idx].id,
              recipe_id: recipe.id,
              user_id: userId,
              amount,
              amount_scale: amountScale,
            })),
          )}
        `;
      }
      return recipe;
    });
  },
});
