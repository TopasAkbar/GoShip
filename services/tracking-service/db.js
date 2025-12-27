const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'db_logistics_tracking',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function initDB() {
  try {
    // Create Tracking table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tracking (
        id SERIAL PRIMARY KEY,
        resi_number VARCHAR(50) UNIQUE NOT NULL,
        order_id VARCHAR(255) NOT NULL,
        current_status VARCHAR(50) NOT NULL DEFAULT 'CREATED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create TrackingHistory table with foreign key
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tracking_history (
        id SERIAL PRIMARY KEY,
        tracking_id INTEGER NOT NULL REFERENCES tracking(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index for faster queries (after tables are created)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tracking_resi ON tracking(resi_number)
    `).catch(err => {
      // Index might already exist or table structure issue
      console.warn('Index creation warning (idx_tracking_resi):', err.message);
    });

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tracking_history_tracking_id ON tracking_history(tracking_id)
    `).catch(err => {
      // Index might already exist or table structure issue
      console.warn('Index creation warning (idx_tracking_history_tracking_id):', err.message);
    });

    console.log('✅ Tracking Service: Database initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

module.exports = { pool, initDB };



