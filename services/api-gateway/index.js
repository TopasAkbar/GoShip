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
  try {
    const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf-8');

    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });

    await server.start();

    // CORS configuration - allow all origins in development
    app.use(cors({
      origin: true, // Allow all origins
      credentials: true,
    }));
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

    // Listen on 0.0.0.0 to accept connections from other containers
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 API Gateway running on http://0.0.0.0:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('❌ Failed to start API Gateway:', error);
    process.exit(1);
  }
}

startServer().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});