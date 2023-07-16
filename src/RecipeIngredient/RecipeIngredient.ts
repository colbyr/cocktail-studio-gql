import { z } from 'zod';
import { ZID } from '../lib/ID';
import { ZAmountScale } from '../AmountScale/AmountScale';

export const ZRecipeIngredient = z.object({
  id: ZID,
  amount: z.number(),
  amount_scale: ZAmountScale.nullable(),
  ingredient_id: ZID,
  user_id: ZID,
});

export type RecipeIngredient = z.infer<typeof ZRecipeIngredient>;
