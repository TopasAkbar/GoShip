const { pool } = require('./db');

const resolvers = {
  Query: {
    couriers: async () => {
      const { rows } = await pool.query('SELECT * FROM couriers ORDER BY nama');
      return rows.map(c => ({
        id: c.id.toString(),
        nama: c.nama,
        noHp: c.no_hp,
        kendaraan: c.kendaraan,
        status: c.status,
        createdAt: c.created_at.toISOString(),
        updatedAt: c.updated_at.toISOString(),
      }));
    },
    courier: async (parent, { id }) => {
      const { rows } = await pool.query('SELECT * FROM couriers WHERE id = $1', [id]);
      if (rows.length === 0) return null;
      const c = rows[0];
      return {
        id: c.id.toString(),
        nama: c.nama,
        noHp: c.no_hp,
        kendaraan: c.kendaraan,
        status: c.status,
        createdAt: c.created_at.toISOString(),
        updatedAt: c.updated_at.toISOString(),
      };
    },
  },
  Mutation: {
    createCourier: async (parent, { nama, noHp, kendaraan }) => {
      const { rows } = await pool.query(
        'INSERT INTO couriers (nama, no_hp, kendaraan) VALUES ($1, $2, $3) RETURNING *',
        [nama, noHp, kendaraan]
      );
      const c = rows[0];
      return {
        id: c.id.toString(),
        nama: c.nama,
        noHp: c.no_hp,
        kendaraan: c.kendaraan,
        status: c.status,
        createdAt: c.created_at.toISOString(),
        updatedAt: c.updated_at.toISOString(),
      };
    },
    updateCourier: async (parent, { id, nama, noHp, kendaraan, status }) => {
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (nama !== undefined) {
        updates.push(`nama = $${paramCount++}`);
        values.push(nama);
      }
      if (noHp !== undefined) {
        updates.push(`no_hp = $${paramCount++}`);
        values.push(noHp);
      }
      if (kendaraan !== undefined) {
        updates.push(`kendaraan = $${paramCount++}`);
        values.push(kendaraan);
      }
      if (status !== undefined) {
        updates.push(`status = $${paramCount++}`);
        values.push(status);
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const { rows } = await pool.query(
        `UPDATE couriers SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      if (rows.length === 0) {
        throw new Error('Courier not found');
      }

      const c = rows[0];
      return {
        id: c.id.toString(),
        nama: c.nama,
        noHp: c.no_hp,
        kendaraan: c.kendaraan,
        status: c.status,
        createdAt: c.created_at.toISOString(),
        updatedAt: c.updated_at.toISOString(),
      };
    },
    deleteCourier: async (parent, { id }) => {
      const { rowCount } = await pool.query('DELETE FROM couriers WHERE id = $1', [id]);
      return rowCount > 0;
    },
  },
};

module.exports = resolvers;




