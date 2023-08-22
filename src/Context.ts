import postgres, { Sql } from 'postgres';
import { Env } from './Env';
import { ContextFunction } from '@apollo/server';
import { StandaloneServerContextFunctionArgument } from '@apollo/server/dist/esm/standalone';
import jwt from 'jsonwebtoken';
import { Token, verifyToken } from './lib/TokenSchema';

export type ContextAuthenticated = {
  sql: Sql;
  token: Token;
  userId: string;
};

export type ContextUnauthenticated = {
  sql: Sql;
  token: null;
  userId: null;
};

export type Context = ContextAuthenticated | ContextUnauthenticated;

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

export const context: ContextFunction<
  [StandaloneServerContextFunctionArgument]
> = async function context({ req }): Promise<Context> {
  const [, encodedToken] = req.headers.authorization?.split(' ') ?? [];
  const body: {
    operationName?: string;
    // @ts-expect-error
  } = req.body;
  if (body.operationName === 'Login') {
    console.info(body);
  }

  if (!encodedToken) {
    return {
      sql,
      token: null,
      userId: null,
    };
  }

  const token = verifyToken(encodedToken);

  return {
    sql,
    token: token,
    userId: token.userId ?? '',
  };
};
