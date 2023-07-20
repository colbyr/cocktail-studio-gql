import { z } from 'zod';

export const Env = z
  .object({
    JWT_SECRET_KEY: z.string(),

    PG_USER: z.string(),
    PG_PASSWORD: z.string(),
    PG_HOST: z.string(),
    PG_PORT: z.coerce.number(),
    PG_DATABASE: z.string(),

    PORT: z.coerce.number().default(4000),
  })
  .parse(process.env);
