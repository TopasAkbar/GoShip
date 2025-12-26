const { pool } = require('./db');

const resolvers = {
  Query: {
    calculateOngkir: async (parent, { kotaAsal, kotaTujuan, berat }) => {
      const { rows } = await pool.query(
        `SELECT * FROM tariff 
         WHERE kota_asal_id = $1 AND kota_tujuan_id = $2`,
        [kotaAsal, kotaTujuan]
      );

      if (rows.length === 0) {
        // Default calculation if no tariff found
        const defaultOngkir = berat * 5000;
        return {
          totalOngkir: Math.max(defaultOngkir, 10000),
          breakdown: [
            {
              metodePengiriman: 'REGULER',
              harga: Math.max(defaultOngkir, 10000),
              estimasiHari: 3,
            },
          ],
        };
      }

      const breakdown = rows.map(t => {
        const harga = Math.max(berat * parseFloat(t.harga_per_kg), parseFloat(t.harga_minimum));
        return {
          metodePengiriman: t.metode_pengiriman,
          harga,
          estimasiHari: t.estimasi_hari,
        };
      });

      return {
        totalOngkir: breakdown[0].harga,
        breakdown,
      };
    },
    getShippingOptions: async (parent, { kotaAsal, kotaTujuan, berat }) => {
      const { rows } = await pool.query(
        `SELECT * FROM tariff 
         WHERE kota_asal_id = $1 AND kota_tujuan_id = $2`,
        [kotaAsal, kotaTujuan]
      );

      if (rows.length === 0) {
        // Default options
        const defaultOngkir = Math.max(berat * 5000, 10000);
        return [
          {
            metodePengiriman: 'REGULER',
            hargaOngkir: defaultOngkir,
            estimasiHari: 3,
          },
        ];
      }

      return rows.map(t => {
        const harga = Math.max(berat * parseFloat(t.harga_per_kg), parseFloat(t.harga_minimum));
        return {
          metodePengiriman: t.metode_pengiriman,
          hargaOngkir: harga,
          estimasiHari: t.estimasi_hari,
        };
      });
    },
  },
  Mutation: {
    createTariff: async (parent, { kotaAsal, kotaTujuan, metodePengiriman, hargaPerKg, hargaMinimum }) => {
      const { rows } = await pool.query(
        `INSERT INTO tariff (kota_asal_id, kota_tujuan_id, metode_pengiriman, harga_per_kg, harga_minimum)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [kotaAsal, kotaTujuan, metodePengiriman, hargaPerKg, hargaMinimum]
      );
      return {
        id: rows[0].id.toString(),
        kotaAsal: rows[0].kota_asal_id.toString(),
        kotaTujuan: rows[0].kota_tujuan_id.toString(),
        metodePengiriman: rows[0].metode_pengiriman,
        hargaPerKg: parseFloat(rows[0].harga_per_kg),
        hargaMinimum: parseFloat(rows[0].harga_minimum),
        createdAt: rows[0].created_at.toISOString(),
      };
    },
  },
};

module.exports = resolvers;




