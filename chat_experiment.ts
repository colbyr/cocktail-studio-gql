import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.COCKTAIL_STUDIO_OPENAI_API_KEY,
  organization: process.env.COCKTAIL_STUDIO_OPENAPI_ORGANIZATION,
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are a knowledgable robot bartender.' },
      { role: 'user', content: 'Briefly, what is Green Chartreuse?' },
    ],
    model: 'gpt-3.5-turbo',
    temperature: 1,
    max_tokens: 96,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  console.log(completion.choices[0]);
}

main().catch(console.error);
