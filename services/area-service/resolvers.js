const { pool } = require('./db');

const resolvers = {
  Query: {
    provinsi: async () => {
      const { rows } = await pool.query('SELECT * FROM provinsi ORDER BY nama');
      return rows.map(p => ({
        id: p.id.toString(),
        nama: p.nama,
      }));
    },
    kota: async (parent, { provinsiId }) => {
      const { rows } = await pool.query(
        'SELECT * FROM kota WHERE provinsi_id = $1 ORDER BY nama',
        [provinsiId]
      );
      return rows.map(k => ({
        id: k.id.toString(),
        nama: k.nama,
        provinsiId: k.provinsi_id.toString(),
      }));
    },
    kecamatan: async (parent, { kotaId }) => {
      const { rows } = await pool.query(
        'SELECT * FROM kecamatan WHERE kota_id = $1 ORDER BY nama',
        [kotaId]
      );
      return rows.map(k => ({
        id: k.id.toString(),
        nama: k.nama,
        kodePos: k.kode_pos,
        kotaId: k.kota_id.toString(),
      }));
    },
    validateKodePos: async (parent, { kodePos }) => {
      const { rows } = await pool.query(
        'SELECT * FROM kecamatan WHERE kode_pos = $1',
        [kodePos]
      );
      if (rows.length === 0) {
        return {
          valid: false,
          kecamatan: null,
          message: 'Kode pos tidak ditemukan',
        };
      }
      const k = rows[0];
      return {
        valid: true,
        kecamatan: {
          id: k.id.toString(),
          nama: k.nama,
          kodePos: k.kode_pos,
          kotaId: k.kota_id.toString(),
        },
        message: 'Kode pos valid',
      };
    },
  },
  Mutation: {
    createProvinsi: async (parent, { nama }) => {
      const { rows } = await pool.query(
        'INSERT INTO provinsi (nama) VALUES ($1) RETURNING *',
        [nama]
      );
      return {
        id: rows[0].id.toString(),
        nama: rows[0].nama,
      };
    },
    createKota: async (parent, { provinsiId, nama }) => {
      const { rows } = await pool.query(
        'INSERT INTO kota (nama, provinsi_id) VALUES ($1, $2) RETURNING *',
        [nama, provinsiId]
      );
      return {
        id: rows[0].id.toString(),
        nama: rows[0].nama,
        provinsiId: rows[0].provinsi_id.toString(),
      };
    },
    createKecamatan: async (parent, { kotaId, nama, kodePos }) => {
      const { rows } = await pool.query(
        'INSERT INTO kecamatan (nama, kode_pos, kota_id) VALUES ($1, $2, $3) RETURNING *',
        [nama, kodePos, kotaId]
      );
      return {
        id: rows[0].id.toString(),
        nama: rows[0].nama,
        kodePos: rows[0].kode_pos,
        kotaId: rows[0].kota_id.toString(),
      };
    },
  },
  Provinsi: {
    kotas: async (parent) => {
      const { rows } = await pool.query(
        'SELECT * FROM kota WHERE provinsi_id = $1',
        [parent.id]
      );
      return rows.map(k => ({
        id: k.id.toString(),
        nama: k.nama,
        provinsiId: k.provinsi_id.toString(),
      }));
    },
  },
  Kota: {
    kecamatans: async (parent) => {
      const { rows } = await pool.query(
        'SELECT * FROM kecamatan WHERE kota_id = $1',
        [parent.id]
      );
      return rows.map(k => ({
        id: k.id.toString(),
        nama: k.nama,
        kodePos: k.kode_pos,
        kotaId: k.kota_id.toString(),
      }));
    },
  },
};

module.exports = resolvers;




