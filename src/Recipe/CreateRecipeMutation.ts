import { mutationField, stringArg } from 'nexus';
import { ZRecipe } from './Recipe';

export const CreateRecipeMutation = mutationField('createRecipe', {
  type: 'Recipe',
  args: {
    name: stringArg(),
  },
  resolve: async (_, { name }, { pool, userId }) => {
    const result = await pool.query(
      `
      INSERT INTO recipe (name, user_id)
      VALUES ($1, $2)
      RETURNING *
      `,
      [name, userId],
    );
    const [newRecipeRow] = result.rows;
    return ZRecipe.parse(newRecipeRow);
  },
});
