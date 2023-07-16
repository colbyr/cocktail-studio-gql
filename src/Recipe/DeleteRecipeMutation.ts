import { list, mutationField, stringArg } from 'nexus';

export const DeleteRecipeMutation = mutationField('deleteRecipe', {
  type: list('ID'),
  args: {
    recipeIds: list('ID'),
  },
  resolve: async (_, { recipeIds }, { sql, userId }) => {
    await sql`
      DELETE FROM recipe
      WHERE user_id = ${userId}
        AND id IN (${sql(recipeIds)})
    `;
    return recipeIds;
  },
});
