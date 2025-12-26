const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const { rows } = await pool.query(
        'SELECT id, username, role, created_at FROM admins WHERE id = $1',
        [context.user.id]
      );
      if (rows.length === 0) {
        throw new Error('User not found');
      }
      return {
        id: rows[0].id.toString(),
        username: rows[0].username,
        role: rows[0].role,
        createdAt: rows[0].created_at.toISOString(),
      };
    },
  },
  Mutation: {
    login: async (parent, { username, password }) => {
      const { rows } = await pool.query(
        'SELECT * FROM admins WHERE username = $1',
        [username]
      );

      if (rows.length === 0) {
        return {
          success: false,
          token: null,
          admin: null,
          message: 'Invalid credentials',
        };
      }

      const admin = rows[0];
      const isValidPassword = await bcrypt.compare(password, admin.password);

      if (!isValidPassword) {
        return {
          success: false,
          token: null,
          admin: null,
          message: 'Invalid credentials',
        };
      }

      const token = jwt.sign(
        { id: admin.id, username: admin.username, role: admin.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return {
        success: true,
        token,
        admin: {
          id: admin.id.toString(),
          username: admin.username,
          role: admin.role,
          createdAt: admin.created_at.toISOString(),
        },
        message: 'Login successful',
      };
    },
    register: async (parent, { username, password }) => {
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { rows } = await pool.query(
          'INSERT INTO admins (username, password, role) VALUES ($1, $2, $3) RETURNING *',
          [username, hashedPassword, 'ADMIN']
        );

        const admin = rows[0];
        const token = jwt.sign(
          { id: admin.id, username: admin.username, role: admin.role },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        return {
          success: true,
          token,
          admin: {
            id: admin.id.toString(),
            username: admin.username,
            role: admin.role,
            createdAt: admin.created_at.toISOString(),
          },
          message: 'Registration successful',
        };
      } catch (error) {
        if (error.code === '23505') {
          return {
            success: false,
            token: null,
            admin: null,
            message: 'Username already exists',
          };
        }
        throw error;
      }
    },
  },
};

module.exports = resolvers;




