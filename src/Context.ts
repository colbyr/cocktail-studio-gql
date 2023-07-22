import postgres, { Sql } from 'postgres';
import { Env } from './Env';
import { ContextFunction } from '@apollo/server';
import { StandaloneServerContextFunctionArgument } from '@apollo/server/dist/esm/standalone';
import jwt from 'jsonwebtoken';

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

  if (!encodedToken && body.operationName === 'Login') {
    return {
      sql,
      userId: '',
    };
  }

  if (!encodedToken && body.operationName === 'Login') {
    throw new Error('no token');
  }

  let token;
  try {
    token = jwt.verify(encodedToken, Env.JWT_SECRET_KEY);
  } catch (err) {
    console.error(err);
    throw new Error('invalid token');
  }

  return {
    sql,
    // @ts-expect-error TODO colbyr
    userId: token.userId ?? '',
  };
};
