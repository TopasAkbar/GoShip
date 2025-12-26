const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'db_logistics_courier',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS couriers (
        id SERIAL PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        no_hp VARCHAR(20) NOT NULL,
        kendaraan VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'AVAILABLE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed initial data
    const { rows: count } = await pool.query('SELECT COUNT(*) FROM couriers');
    if (parseInt(count[0].count) === 0) {
      await pool.query(
        'INSERT INTO couriers (nama, no_hp, kendaraan, status) VALUES ($1, $2, $3, $4)',
        ['Budi Santoso', '081234567890', 'Motor', 'AVAILABLE']
      );
      await pool.query(
        'INSERT INTO couriers (nama, no_hp, kendaraan, status) VALUES ($1, $2, $3, $4)',
        ['Siti Nurhaliza', '081987654321', 'Mobil', 'AVAILABLE']
      );
      console.log('✅ Courier Service: Initial data seeded');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

module.exports = { pool, initDB };




