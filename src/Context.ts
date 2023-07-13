import postgres, { Sql } from 'postgres';
import { Env } from './Env';

export type Context = {
  sql: Sql;
  userId: string;
};

const sql = postgres({
  user: Env.PG_USER,
  password: Env.PG_PASSWORD,
  host: Env.PG_HOST,
  port: Env.PG_PORT,
  database: Env.PG_DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 4,
});

export async function context(): Promise<Context> {
  return {
    sql,
    userId: '1',
  };
}
