import postgres, { Sql } from 'postgres';
import { Env } from './Env';

export type Context = {
  sql: Sql;
  userId: string;
};

export async function context(): Promise<Context> {
  return {
    sql: postgres({
      user: Env.PG_USER,
      password: Env.PG_PASSWORD,
      host: Env.PG_HOST,
      port: Env.PG_PORT,
      database: Env.PG_DATABASE,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 5,
    }),

    userId: '1',
  };
}
