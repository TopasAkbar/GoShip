require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { readFileSync } = require('fs');
const { join } = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const resolvers = require('./resolvers');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

async function startServer() {
  const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf-8');

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(cors());
  app.use(express.json());

  // JWT authentication middleware
  app.use('/graphql', (req, res, next) => {
    const authHeader = req.headers.authorization;
    let user = null;
    let token = null;

    if (authHeader) {
      token = authHeader;
      try {
        user = jwt.verify(authHeader.replace('Bearer ', ''), JWT_SECRET);
      } catch (error) {
        // Token invalid, but continue (some queries don't need auth)
        user = null;
      }
    }

    req.user = user;
    req.token = token;
    next();
  });

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: ({ req }) => ({
        user: req.user,
        token: req.token,
      }),
    })
  );

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'api-gateway' });
  });

  app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(console.error);




