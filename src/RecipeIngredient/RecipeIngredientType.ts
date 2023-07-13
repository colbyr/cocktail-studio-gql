import { objectType } from 'nexus';
import { join } from 'path';
import { ZIngredient } from '../Ingredient/Ingredient';

export const RecipeIngredientType = objectType({
  name: 'RecipeIngredient',
  sourceType: {
    module: join(__dirname, './RecipeIngredient.ts'),
    export: 'RecipeIngredient',
  },
  definition(t) {
    t.id('id');

    t.float('amount');

    t.field('amountScale', {
      type: 'AmountScale',
      resolve: async ({ amount_scale }) => {
        return amount_scale;
      },
    });

    t.field('ingredient', {
      type: 'Ingredient',
      resolve: async ({ ingredient_id, user_id }, _args, { sql }) => {
        const result = await sql`
          SELECT *
          FROM ingredient
          WHERE user_id = ${user_id}
            AND id = ${ingredient_id}
        `;
        const [ingredient] = result;
        return ZIngredient.parse(ingredient);
      },
    });
  },
});
