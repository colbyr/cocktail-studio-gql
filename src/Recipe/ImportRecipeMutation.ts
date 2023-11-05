import dedent from 'dedent';
import { list, mutationField, objectType, stringArg } from 'nexus';
import { z } from 'zod';
import { ZAmountScale } from '../AmountScale/AmountScale';
import { ChatCompletion, ChatCompletionMessage } from 'openai/resources';
import { requireAuth } from '../lib/Authorize';

const options = {
  model: 'gpt-4',
  temperature: 1,
  max_tokens: 512,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

const systemMessage: ChatCompletionMessage = {
  role: 'system',
  content: dedent`
    You are a bartender that converts cocktail recipes into JSON.
    The description is 1 sentence and does not refer to the recipe's title or ingredients.
    You always put ingredient names in title case.
    You convert 30 milliliters to 1 fluid ounce  and 1 ounce to 28.5 grams.
    You convert each amount to a decimal number.
    Your response should only contain JSON and it should match this typescript schema.

    type Recipe = {
      name: string;
      description: string;
      recipeIngredients: {
        ingredientName: string;
        note?: string;
        amount: number;
        amountScale: "one" | "mL" | "floz" | "dash" | "drop" | "oz" | "g";
      };
    }
  `,
};

const ZRecipeImportSchema = z.object({
  name: z.string(),
  description: z.string(),
  recipeIngredients: z.array(
    z.object({
      ingredientName: z.string(),
      note: z.string().optional(),
      amount: z.number(),
      amountScale: ZAmountScale,
    }),
  ),
});

export const ImportRecipeMutation = mutationField('importRecipe', {
  authorize: (root, args, context) => {
    return (
      requireAuth(root, args, context) && context.token?.anonymous !== true
    );
  },
  type: objectType({
    name: 'RecipeImport',
    definition(t) {
      t.string('name');
      t.nullable.string('description');
      t.nullable.string('directions');
      t.field('recipeIngredients', {
        type: list(
          objectType({
            name: 'RecipeImportIngredient',
            definition(t) {
              t.float('amount');
              t.field({
                name: 'amountScale',
                type: 'AmountScale',
              });
              t.string('ingredientName');
            },
          }),
        ),
      });
    },
  }),
  args: {
    recipeText: stringArg(),
  },
  resolve: async (_root, { recipeText }, { openai }) => {
    const completion: ChatCompletion = await openai.chat.completions.create({
      ...options,
      messages: [
        systemMessage,
        {
          role: 'user',
          content: dedent`
            Convert this recipe to JSON:

            \`\`\`
            ${recipeText}
            \`\`\`
          `,
        },
      ],
    });
    const jsonResult = JSON.parse(
      completion.choices[0]?.message.content ?? '{}',
    );
    return ZRecipeImportSchema.parse(jsonResult);
  },
});
