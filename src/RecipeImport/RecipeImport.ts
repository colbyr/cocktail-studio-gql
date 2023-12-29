import { z } from 'zod';
import { ZAmountScale } from '../AmountScale/AmountScale';

export const ZRecipeImport = z.object({
  name: z.string(),
  description: z.string(),
  recipeIngredients: z.array(
    z.object({
      ingredientName: z.string(),
      note: z.string().optional(),
      amount: z.number(),
      amountScale: ZAmountScale,
    }),
  ),
});

export type RecipeImport = z.infer<typeof ZRecipeImport>;
