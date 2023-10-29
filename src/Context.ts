import postgres, { Sql } from 'postgres';
import { Env } from './Env';
import { ContextFunction } from '@apollo/server';
import { StandaloneServerContextFunctionArgument } from '@apollo/server/dist/esm/standalone';
import jwt from 'jsonwebtoken';
import { Token, verifyToken } from './lib/TokenSchema';
import * as loaderDefinitions from './loaders';
import { ScopedDataLoaders } from './lib/ScopedDataLoaders';
import DataLoader from 'dataloader';
import OpenAI from 'openai';

export type ContextAuthenticated = Readonly<{
  openai: OpenAI;
  sql: Sql;
  token: Token;
  userId: string;
}>;

export type ContextUnauthenticated = Readonly<{
  openai: OpenAI;
  sql: Sql;
  token: null;
  userId: null;
}>;

export type Context = ContextAuthenticated | ContextUnauthenticated;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

type L = typeof loaderDefinitions;
type LoaderInstances = UnionToIntersection<
  ReturnType<L[keyof L]['makeLoaders']>
>;

function makeLoaders(
  definitions: typeof loaderDefinitions,
  context: Context,
): LoaderInstances {
  const result: Record<string, DataLoader<unknown, unknown, unknown>> = {};
  for (const scoped of Object.values(definitions)) {
    if (scoped instanceof ScopedDataLoaders) {
      for (const [key, maybeLoader] of Object.entries(
        scoped.makeLoaders(context),
      )) {
        if (maybeLoader instanceof DataLoader) {
          result[key as keyof LoaderInstances] = maybeLoader;
        }
      }
    }
  }
  return result as LoaderInstances;
}

export type ContextWithLoaders = Context & {
  loaders: LoaderInstances;
};

const openai = new OpenAI({
  apiKey: process.env.COCKTAIL_STUDIO_OPENAI_API_KEY,
  organization: process.env.COCKTAIL_STUDIO_OPENAPI_ORGANIZATION,
});

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
> = async function context({ req }): Promise<ContextWithLoaders> {
  const [, encodedToken] = req.headers.authorization?.split(' ') ?? [];
  const body: {
    operationName?: string;
    // @ts-expect-error
  } = req.body;

  if (!encodedToken) {
    const noAuthContext: ContextUnauthenticated = {
      openai,
      sql,
      token: null,
      userId: null,
    };
    return {
      ...noAuthContext,
      loaders: makeLoaders(loaderDefinitions, noAuthContext),
    };
  }

  const token = verifyToken(encodedToken);

  const authedContext: ContextAuthenticated = {
    openai,
    sql,
    token: token,
    userId: token.userId ?? '',
  };
  return {
    ...authedContext,
    loaders: makeLoaders(loaderDefinitions, authedContext),
  };
};
