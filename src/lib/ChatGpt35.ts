import { number, z } from 'zod';

const ZChatGpt35CompletionMessage = z.object({
  content: z.string().nullable(),
  role: z.enum(['function', 'system', 'user', 'assistant']),
});

const ZChatGpt35CompletionChoice = z.object({
  finish_reason: z.enum(['stop', 'length', 'function_call', 'content_filter']),
  index: z.number(),
  message: ZChatGpt35CompletionMessage,
});

const ZChatGpt35CompletionUsage = z.object({
  completion_tokens: z.number(),
  prompt_tokens: z.number(),
  total_tokens: z.number(),
});

export const ZChatGpt35CompletionSchema = z.object({
  id: z.string(),
  choices: z.array(ZChatGpt35CompletionChoice),
  created: z.number(),
  model: z.string(),
  object: z.literal('chat.completion'),
  usage: ZChatGpt35CompletionUsage.optional(),
});
