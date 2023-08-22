import { z } from 'zod';

export const AnonymousUserSchema = z.object({
  id: z.coerce.string(),
  email: z.null(),
});

export type AnonymousUser = z.infer<typeof AnonymousUserSchema>;

export const KnownUserSchema = z.object({
  id: z.coerce.string(),
  email: z.string(),
});

export type KnownUser = z.infer<typeof KnownUserSchema>;

export const UserSchema = z.union([AnonymousUserSchema, KnownUserSchema]);

export type User = z.infer<typeof UserSchema>;
