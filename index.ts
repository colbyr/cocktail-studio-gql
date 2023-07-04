import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { makeSchema, queryType } from 'nexus';
import { resolveImportPath, result } from 'nexus/dist/utils';
import { join } from "path";
import { Pool } from "pg";
import { z } from 'zod';

const Env = z.object({
  PG_USER: z.string(),
  PG_PASSWORD: z.string(),
  PG_HOST: z.string(),
  PG_PORT: z.coerce.number(),
  PG_DATABASE: z.string(),

  PORT: z.coerce.number().default(4000)
}).parse(process.env)

const pgPool = new Pool({
  user: Env.PG_USER,
  password: Env.PG_PASSWORD,
  host: Env.PG_HOST,
  port: Env.PG_PORT,
  database: Env.PG_DATABASE,
  ssl: {
    rejectUnauthorized: false
  }
})

const QueryType = queryType({
  definition(t) {
    t.string("hello", {
      resolve: () => "world"
    })

    t.int("recipeCount", {
      resolve:async () => {
        const result = await pgPool.query(
          `
          SELECT COUNT(*)
          FROM recipe
          `
        )
        const [{count}] = z.array(z.object({count: z.coerce.number()})).parse(result.rows)
        return count;
      }

    })
  },
})

const schema = makeSchema({
  types: [
    QueryType
  ],
  nonNullDefaults: {
    input: true,
    output: true
  },
  outputs: {
    typegen: join(__dirname, '../nexus-typegen.ts'),
    schema: join(__dirname, '../schema.graphql')
  }
})

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  schema,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
startStandaloneServer(server, {
  listen: { port: Env.PORT },
}).then(({url}) => {
  console.log(`🚀  Server ready at: ${url}`);
})
