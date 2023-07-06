import { z } from 'zod';

export const ZRecipe = z.object({
  id: z.coerce.string(),
  name: z.string(),
  description: z.string().nullable(),
  userId: z.coerce.string(),
});
export type Recipe = z.infer<typeof ZRecipe>;
