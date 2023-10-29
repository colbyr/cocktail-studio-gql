import DataLoader from 'dataloader';
import { ScopedDataLoaders, zParseById } from '../lib/ScopedDataLoaders';
import { ChatCompletion } from 'openai/resources';
import { z } from 'zod';
import { ZChatGpt35CompletionSchema } from '../lib/ChatGpt35';

const ZIngredientAiDescriptionCache = z.object({
  subject: z.string(),
  completion: ZChatGpt35CompletionSchema.nullable(),
});

export const AiIngredientLoaders = new ScopedDataLoaders(({ openai, sql }) => {
  const ingredientAiDescriptionCache = new DataLoader<
    string,
    z.infer<typeof ZIngredientAiDescriptionCache> | null
  >(async (ingredientNames) => {
    const query = sql`
      SELECT subject, completion
      FROM (VALUES ${sql(ingredientNames.map((name) => [name]))}) t(subject)
      LEFT JOIN gpt35_cache ON (
        gpt35_cache.query_type = 'ingredient_description'
        AND gpt35_cache.subject_vector = to_tsvector(subject)
      )
    `;
    const rows = await query;
    return zParseById({
      ZType: ZIngredientAiDescriptionCache.nullable(),
      id: 'subject',
      requestedIds: ingredientNames,
      rows,
    });
  });

  const ingredientAiDescription = new DataLoader<
    string,
    { content: string | null }
  >(
    async ([ingredientName]) => {
      const cachedCompletion = await ingredientAiDescriptionCache.load(
        ingredientName,
      );

      if (cachedCompletion?.completion?.choices[0]) {
        return [cachedCompletion.completion.choices[0].message];
      }

      const completion: ChatCompletion = await openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a knowledgable robot bartender.',
          },
          {
            role: 'user',
            content: `In one sentence, what is ${ingredientName}?`,
          },
        ],
        model: 'gpt-3.5-turbo',
        temperature: 1,
        max_tokens: 64,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      console.info(JSON.stringify(completion, null, 2));
      await sql`
        INSERT INTO gpt35_cache (query_type, subject_vector, completion)
        VALUES ('ingredient_description', to_tsvector(${ingredientName}), ${sql.json(
          completion as any,
        )}::JSONB)
      `;
      return [completion.choices[0]?.message ?? { content: '' }];
    },
    {
      maxBatchSize: 1,
    },
  );

  return { ingredientAiDescription };
});
