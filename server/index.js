const { ApolloServer, gql } = require("apollo-server-express");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const express = require("express");
const http = require("http");
const cors = require("cors");

let posts = [
  {
    id: "1",
    title: "Post 1",
    description: "description 1",
  },
  {
    id: "2",
    title: "Post 2",
    description: "desction 2",
  },
];

const typeDefs = gql`
  type Post {
    id: ID!
    title: String!
    description: String!
  }

  type Query {
    post(id: ID!): Post
    posts: [Post]
  }

  type Mutation {
    addPost(title: String!, description: String!): Post
    deletePost(id: ID!): ID
  }
`;

const resolvers = {
  Query: {
    post: (_, { id }) => posts.find((post) => post.id === id),
    posts: () => posts,
  },
  Mutation: {
    addPost(_, { title, description }) {
      const post = {
        id: `${posts.length + 1}`,
        title,
        description,
      };
      posts.push(post);
      return post;
    },
    deletePost(_, { id }) {
      posts = posts.filter((post) => post.id !== id);
      return id;
    },
  },
};

async function startApolloServer(typeDefs, resolvers) {
  const app = express();
  // app.use(cors());
  const corsOptions = {
    origin: "*",
    credentials: true,
  };
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  server.applyMiddleware({ app, cors: true });

  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));

  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}

startApolloServer(typeDefs, resolvers);
