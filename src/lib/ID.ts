import { z } from 'zod';

export const ZID = z.coerce.string();

export type ID = z.infer<typeof ZID>;
