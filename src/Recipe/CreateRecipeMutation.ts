import { mutationField, stringArg } from 'nexus';
import { ZRecipe } from './Recipe';

export const CreateRecipeMutation = mutationField('createRecipe', {
  type: 'Recipe',
  args: {
    name: stringArg(),
  },
  resolve: async (_, { name }, { pool, sql, userId }) => {
    const result = await sql`
      INSERT INTO recipe
      ${sql({ name })}

      RETURNING *
      `;
    const [newRecipeRow] = result;
    return ZRecipe.parse(newRecipeRow[0]);
  },
});
