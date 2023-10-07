import { idArg, list, mutationField } from 'nexus';
import { requireAuth } from '../lib/Authorize';

export const DeleteIngredientsMutation = mutationField('deleteIngredients', {
  type: list('ID'),
  authorize: requireAuth,
  args: {
    ingredientIds: list(idArg()),
  },
  resolve: async (_, { ingredientIds }, { loaders, sql, userId }) => {
    const ingredientCount = await loaders.recipesCountByIngredientId.loadMany(
      ingredientIds,
    );

    if (
      ingredientCount.some(
        (result) =>
          result && !(result instanceof Error) && result.recipes_count > 0,
      )
    ) {
      throw new Error("Can't delete ingredients that are used in recipes");
    }

    await sql`
      UPDATE ingredient
      SET updated_at = NOW(), deleted_at = NOW()
      WHERE user_id = ${userId}
        AND id IN (${sql(ingredientIds)})
    `;

    return ingredientIds;
  },
});
