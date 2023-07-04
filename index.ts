import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { makeSchema, queryType } from 'nexus';
import { join } from "path";

const QueryType = queryType({
  definition(t) {
      t.string("hello", {
        resolve: () => "world"
      })
  },
})

const schema = makeSchema({
  types: [
    QueryType
  ],
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
  listen: { port: 4000 },
}).then(({url}) => {
  console.log(`🚀  Server ready at: ${url}`);
})
