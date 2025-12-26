const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'db_logistics_tariff',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tariff (
        id SERIAL PRIMARY KEY,
        kota_asal_id INTEGER NOT NULL,
        kota_tujuan_id INTEGER NOT NULL,
        metode_pengiriman VARCHAR(50) NOT NULL,
        harga_per_kg DECIMAL(10, 2) NOT NULL,
        harga_minimum DECIMAL(10, 2) NOT NULL,
        estimasi_hari INTEGER DEFAULT 3,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed initial tariff data
    const { rows: count } = await pool.query('SELECT COUNT(*) FROM tariff');
    if (parseInt(count[0].count) === 0) {
      // Default tariff: same city
      await pool.query(`
        INSERT INTO tariff (kota_asal_id, kota_tujuan_id, metode_pengiriman, harga_per_kg, harga_minimum, estimasi_hari)
        VALUES (1, 1, 'REGULER', 5000, 10000, 1)
      `);
      await pool.query(`
        INSERT INTO tariff (kota_asal_id, kota_tujuan_id, metode_pengiriman, harga_per_kg, harga_minimum, estimasi_hari)
        VALUES (1, 1, 'EXPRESS', 10000, 20000, 1)
      `);
      // Different city
      await pool.query(`
        INSERT INTO tariff (kota_asal_id, kota_tujuan_id, metode_pengiriman, harga_per_kg, harga_minimum, estimasi_hari)
        VALUES (1, 2, 'REGULER', 8000, 15000, 3)
      `);
      await pool.query(`
        INSERT INTO tariff (kota_asal_id, kota_tujuan_id, metode_pengiriman, harga_per_kg, harga_minimum, estimasi_hari)
        VALUES (1, 2, 'EXPRESS', 15000, 25000, 2)
      `);
      console.log('✅ Tariff Service: Initial data seeded');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

module.exports = { pool, initDB };




