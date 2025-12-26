const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'db_logistics_area',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS provinsi (
        id SERIAL PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS kota (
        id SERIAL PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        provinsi_id INTEGER REFERENCES provinsi(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS kecamatan (
        id SERIAL PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        kode_pos VARCHAR(10) UNIQUE NOT NULL,
        kota_id INTEGER REFERENCES kota(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed initial data
    const { rows: provCount } = await pool.query('SELECT COUNT(*) FROM provinsi');
    if (parseInt(provCount[0].count) === 0) {
      const { rows: prov } = await pool.query(
        'INSERT INTO provinsi (nama) VALUES ($1) RETURNING id',
        ['Jawa Barat']
      );
      const provId = prov[0].id;

      const { rows: kota } = await pool.query(
        'INSERT INTO kota (nama, provinsi_id) VALUES ($1, $2) RETURNING id',
        ['Bandung', provId]
      );
      const kotaId = kota[0].id;

      await pool.query(
        'INSERT INTO kecamatan (nama, kode_pos, kota_id) VALUES ($1, $2, $3)',
        ['Coblong', '40131', kotaId]
      );
      await pool.query(
        'INSERT INTO kecamatan (nama, kode_pos, kota_id) VALUES ($1, $2, $3)',
        ['Sukajadi', '40162', kotaId]
      );

      console.log('✅ Area Service: Initial data seeded');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

module.exports = { pool, initDB };




