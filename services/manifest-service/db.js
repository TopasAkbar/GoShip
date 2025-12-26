const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'db_logistics_manifest',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

function generateResi() {
  const prefix = 'GS';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shipments (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(255) UNIQUE NOT NULL,
        nomor_resi VARCHAR(50) UNIQUE,
        alamat_pengiriman TEXT NOT NULL,
        alamat_penjemputan TEXT NOT NULL,
        berat DECIMAL(10, 2) NOT NULL,
        kota_asal_id INTEGER NOT NULL,
        kota_tujuan_id INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        ongkir DECIMAL(10, 2),
        metode_pengiriman VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Manifest Service: Database initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

module.exports = { pool, initDB, generateResi };




