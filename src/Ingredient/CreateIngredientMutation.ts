import { mutationField, nullable, stringArg } from 'nexus';
import { z } from 'zod';
import { requireAuth } from '../lib/Authorize';
import { ZIngredient } from './Ingredient';

export const CreateIngredientMutation = mutationField('createIngredient', {
  type: 'Ingredient',
  authorize: requireAuth,
  args: {
    name: stringArg(),
    description: nullable(stringArg()),
    directions: nullable(stringArg()),
  },
  resolve: async (_, { name, description, directions }, { sql, userId }) => {
    return sql.begin(async (sql) => {
      const [ingredient] = z.array(ZIngredient).parse(
        await sql`
          INSERT INTO ingredient
          ${sql({
            name: name.trim(),
            description: description ?? '',
            directions: directions ?? '',
            user_id: userId,
          })}
          RETURNING *
        `,
      );
      return ingredient;
    });
  },
});
