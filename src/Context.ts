import { Pool } from 'pg';
import postgres, { Sql } from 'postgres';
import { Env } from './Env';

export type Context = {
  pool: Pool;
  sql: Sql;
  userId: string;
};

export async function context(): Promise<Context> {
  return {
    pool: new Pool({
      user: Env.PG_USER,
      password: Env.PG_PASSWORD,
      host: Env.PG_HOST,
      port: Env.PG_PORT,
      database: Env.PG_DATABASE,
      ssl: {
        rejectUnauthorized: false,
      },
    }),

    sql: postgres({
      user: Env.PG_USER,
      password: Env.PG_PASSWORD,
      host: Env.PG_HOST,
      port: Env.PG_PORT,
      database: Env.PG_DATABASE,
      ssl: {
        rejectUnauthorized: false,
      },
    }),

    userId: '1',
  };
}
