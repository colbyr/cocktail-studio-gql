import { Env } from '../Env';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

export const TokenSchema = z.object({
  anonymous: z.boolean().optional(),
  userId: z.string(),
  time: z.coerce.date(),
});

export type Token = z.infer<typeof TokenSchema>;

export function signToken(user: { id: string | number }) {
  const token: Token = {
    time: new Date(),
    userId: `${user.id}`,
  };
  return jwt.sign(token, Env.JWT_SECRET_KEY);
}

export function signAnonymousToken(user: { id: string }) {
  const token: Token = {
    anonymous: true,
    time: new Date(),
    userId: `${user.id}`,
  };
  return jwt.sign(token, Env.JWT_SECRET_KEY);
}

export function verifyToken(tokenString: string): Token {
  try {
    return TokenSchema.parse(jwt.verify(tokenString, Env.JWT_SECRET_KEY));
  } catch (err) {
    console.error(err);
    throw new Error('invalid token');
  }
}
