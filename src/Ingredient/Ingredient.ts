import { z } from 'zod';
import { ZID } from '../lib/ID';

export const ZIngredient = z.object({
  id: ZID,
  description: z.string().nullable(),
  directions: z.string().nullable(),
  name: z.string(),
  user_id: ZID,
});

export type Ingredient = z.infer<typeof ZIngredient>;
