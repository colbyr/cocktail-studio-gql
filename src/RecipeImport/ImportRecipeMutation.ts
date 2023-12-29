import dedent from 'dedent';
import { list, mutationField, objectType, stringArg } from 'nexus';
import { z } from 'zod';
import { ZAmountScale } from '../AmountScale/AmountScale';
import { ChatCompletion, ChatCompletionMessage } from 'openai/resources';
import { requireAuth } from '../lib/Authorize';
import { ZRecipeImport } from './RecipeImport';

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

export const ImportRecipeMutation = mutationField('importRecipe', {
  authorize: (root, args, context) => {
    return (
      requireAuth(root, args, context) && context.token?.anonymous !== true
    );
  },
  description: 'Import a recipe from arbitrary text',
  type: 'RecipeImport',
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
    return ZRecipeImport.parse(jsonResult);
  },
});
