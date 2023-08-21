import { z } from 'zod';

export const UserSchema = z.object({
  id: z.coerce.string(),
  email: z.string().nullable(),
});

export type User = z.infer<typeof UserSchema>;
