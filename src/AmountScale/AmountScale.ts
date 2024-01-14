import { z } from 'zod';

export const ZAmountScale = z.enum([
  // no unit just a number of things
  'one',

  // cocktail specific liquids
  'dash',
  'drop',

  // imperial liquids
  'floz',
  'tsp',
  'tbsp',
  'cup',
  'pt',
  'qt',
  'gal',

  // imperial weight
  'lb',
  'oz',

  // metric liquid
  'mL',
  'L',

  // metric weight
  'g',
  'kg',
]);

export type AmountScale = z.infer<typeof ZAmountScale>;
