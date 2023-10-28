import { idArg, list, mutationField } from 'nexus';
import { requireAuth } from '../lib/Authorize';

export const DeleteRecipesMutation = mutationField('deleteRecipes', {
  type: list('ID'),
  authorize: requireAuth,
  args: {
    recipeIds: list(idArg()),
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
