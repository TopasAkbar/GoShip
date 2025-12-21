const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { readFileSync } = require('fs');
const { join } = require('path');
const resolvers = require('./resolvers');
const sequelize = require('./config/database');
require('dotenv').config();

const app = express();

const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf8');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Tracking Service: Database connection established.');

    await sequelize.sync();
    console.log('Tracking Service: Database tables synced.');

    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });

    const PORT = process.env.PORT || 4002;
    app.listen(PORT, () => {
      console.log(`Tracking Service running on http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();





