import { z } from 'zod';
import { ZAmountScale } from '../AmountScale/AmountScale';

export const ZRecipeImport = z.object({
  name: z.string(),
  description: z.string().optional(),
  directions: z.string().optional(),
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
