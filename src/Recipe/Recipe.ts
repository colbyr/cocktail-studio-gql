import { z } from 'zod';

export const ZRecipe = z.object({
  id: z.coerce.string(),
  created_at: z.coerce.date(),
  name: z.string(),
  description: z.string().nullable(),
  directions: z.string().nullable(),
  updated_at: z.coerce.date(),
  user_id: z.coerce.string(),
});

export type Recipe = z.infer<typeof ZRecipe>;
