import { z } from 'zod';
import { ZID } from '../lib/ID';

export const ZIngredient = z.object({
  id: ZID,
  created_at: z.date(),
  description: z.string().nullable(),
  directions: z.string().nullable(),
  name: z.string(),
  type_of_ingredient_id: z.string(),
  updated_at: z.date(),
  user_id: ZID,
});

export type Ingredient = z.infer<typeof ZIngredient>;
