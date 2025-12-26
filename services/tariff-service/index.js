require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { readFileSync } = require('fs');
const { join } = require('path');
const cors = require('cors');
const { initDB } = require('./db');
const resolvers = require('./resolvers');

const app = express();
const PORT = process.env.PORT || 4003;

async function startServer() {
  await initDB();

  const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf-8');

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(cors());
  app.use(express.json());
  app.use('/graphql', expressMiddleware(server));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'tariff-service' });
  });

  app.listen(PORT, () => {
    console.log(`🚀 Tariff Service running on http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(console.error);




