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
  },
  resolve: async (
    _,
    { ingredientId, name, description, directions },
    { sql, userId },
  ) => {
    const [ingredient] = z.array(ZIngredient).parse(
      await sql`
        UPDATE ingredient
        SET ${sql({
          name: name.trim(),
          description: description ?? '',
          directions: directions ?? '',
          updated_at: new Date().toISOString(),
        })}
        WHERE id = ${ingredientId}
          AND user_id = ${userId}
        RETURNING *
      `,
    );
    return ingredient;
  },
});
