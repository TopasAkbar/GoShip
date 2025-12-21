const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { readFileSync } = require('fs');
const { join } = require('path');
const resolvers = require('./resolvers');
const { analyticsDb, trackingDb, courierDb, manifestDb } = require('./config/database');
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
    // Connect to all databases
    await analyticsDb.authenticate();
    console.log('Analytics Service: Analytics database connection established.');

    await trackingDb.authenticate();
    console.log('Analytics Service: Tracking database connection established.');

    await courierDb.authenticate();
    console.log('Analytics Service: Courier database connection established.');

    await manifestDb.authenticate();
    console.log('Analytics Service: Manifest database connection established.');

    // Sync analytics database only
    await analyticsDb.sync();
    console.log('Analytics Service: Database tables synced.');

    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });

    const PORT = process.env.PORT || 4006;
    app.listen(PORT, () => {
      console.log(`Analytics Service running on http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();





