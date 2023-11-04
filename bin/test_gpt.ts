import dedent from 'dedent';
import OpenAI from 'openai';
import { ChatCompletion } from 'openai/resources';

const openai = new OpenAI({
  apiKey: process.env.COCKTAIL_STUDIO_OPENAI_API_KEY,
  organization: process.env.COCKTAIL_STUDIO_OPENAPI_ORGANIZATION,
});

async function main() {
  console.time('completion');
  const completion: ChatCompletion = await openai.chat.completions.create({
    messages: [
      {
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
      },
      {
        role: 'user',
        content: dedent`
          Convert this recipe to JSON:

          \`\`\`
          Daiquiri
          - 60 mL White Rum
          - 30 mL Lime Juice
          - 22.5 mL Simple Syrup
          \`\`\`
        `,
      },
    ],
    model: 'gpt-4',
    temperature: 1,
    max_tokens: 512,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  console.timeEnd('completion');
  const result = JSON.parse(completion.choices[0]?.message.content ?? '');
  console.info(result);
}

main().catch(console.error);
