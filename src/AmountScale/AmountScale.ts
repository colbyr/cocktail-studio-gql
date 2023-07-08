import { z } from 'zod';

export const ZAmountScale = z.enum(['floz', 'mL', 'dash', 'drop', 'g', 'oz']);

export type AmountScale = z.infer<typeof ZAmountScale>;
