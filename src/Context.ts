import { Pool } from "pg"
import { Env } from "./Env"

export type Context = {
  pool: Pool
}

export async function context(): Promise<Context> {
  return {
    pool: new Pool({
      user: Env.PG_USER,
      password: Env.PG_PASSWORD,
      host: Env.PG_HOST,
      port: Env.PG_PORT,
      database: Env.PG_DATABASE,
      ssl: {
        rejectUnauthorized: false
      }
    })
  };
}