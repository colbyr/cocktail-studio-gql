import { idArg, mutationField, nullable, stringArg } from 'nexus';
import { z } from 'zod';
import { requireAuth } from '../lib/Authorize';
import { ZIngredient } from './Ingredient';

export const UpdateIngredientMutation = mutationField('updateIngredient', {
  type: 'Ingredient',
  authorize: requireAuth,
  args: {
    ingredientId: idArg(),
    name: stringArg(),
    description: nullable(stringArg()),
    directions: nullable(stringArg()),
    typeOfIngredientName: nullable(stringArg()),
  },
  resolve: async (
    _,
    { ingredientId, name, description, directions, typeOfIngredientName },
    { sql, userId },
  ) => {
    return sql.begin(async (sql) => {
      if (typeOfIngredientName) {
        await sql`
          INSERT INTO ingredient
          ${sql({
            name: typeOfIngredientName.trim(),
            user_id: userId,
          })}
          ON CONFLICT DO NOTHING
        `;
      }
      const [typeOfIngredient] = typeOfIngredientName?.trim()
        ? await sql`
            SELECT id
            FROM ingredient
            WHERE user_id = ${userId}
              AND name_vector = tsvector_name(${typeOfIngredientName.trim()})
          `
        : [];
      const [ingredient] = z.array(ZIngredient).parse(
        await sql`
          UPDATE ingredient
          SET ${sql({
            name: name.trim(),
            description: description ?? '',
            directions: directions ?? '',
            type_of_ingredient_id: typeOfIngredient?.id ?? null,
            updated_at: new Date().toISOString(),
          })}
          WHERE id = ${ingredientId}
            AND user_id = ${userId}
          RETURNING *
        `,
      );
      return ingredient;
    });
  },
});
