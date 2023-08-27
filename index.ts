import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { fieldAuthorizePlugin, makeSchema } from 'nexus';
import { join } from 'path';
import * as types from './src/types';
import { Env } from './src/Env';
import { context } from './src/Context';

const schema = makeSchema({
  contextType: {
    module: join(__dirname, 'src/Context.ts'),
    export: 'ContextWithLoaders',
  },
  nonNullDefaults: {
    input: true,
    output: true,
  },
  outputs: {
    schema: join(__dirname, '__generated__/schema.graphql'),
    typegen: join(__dirname, '__generated__/typings.ts'),
  },
  plugins: [fieldAuthorizePlugin()],
  types,
});

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
  context,
  listen: { port: Env.PORT },
}).then(({ url }) => {
  console.log(`🚀  Server ready at: ${url}`);
});
