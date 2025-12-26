const { pool } = require('./db');

const STATUS_ORDER = ['CREATED', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_AT_HUB', 'OUT_FOR_DELIVERY', 'DELIVERED'];

function isValidStatusTransition(currentStatus, newStatus) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const newIndex = STATUS_ORDER.indexOf(newStatus);
  if (newIndex <= currentIndex) return false;
  if (newIndex - currentIndex > 2) return false;
  return true;
}

const resolvers = {
  Query: {
    trackingByResi: async (parent, { resiNumber }) => {
      // PERBAIKAN: Gunakan UPPER dan TRIM
      const cleanResi = resiNumber.trim().toUpperCase();
      const { rows } = await pool.query(
        `SELECT t.*, 
          json_agg(
            json_build_object(
              'id', th.id, 'status', th.status, 'description', th.description,
              'location', th.location, 'timestamp', th.timestamp
            ) ORDER BY th.timestamp DESC
          ) FILTER (WHERE th.id IS NOT NULL) as histories
          FROM tracking t
          LEFT JOIN tracking_history th ON t.id = th.tracking_id
          WHERE UPPER(t.resi_number) = $1
          GROUP BY t.id`,
        [cleanResi]
      );

      if (rows.length === 0) throw new Error(`Tracking not found for resi number: ${resiNumber}`);

      const t = rows[0];
      return {
        id: t.id.toString(),
        resiNumber: t.resi_number,
        orderId: t.order_id,
        currentStatus: t.current_status,
        createdAt: t.created_at.toISOString(),
        histories: (t.histories || []).map(h => ({
          ...h, id: h.id.toString(),
          timestamp: h.timestamp ? new Date(h.timestamp).toISOString() : new Date().toISOString(),
        })),
      };
    },
  },
  Mutation: {
    createTracking: async (parent, { resiNumber, orderId }) => {
      const cleanResi = resiNumber.trim().toUpperCase();
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const { rows } = await client.query(
          `INSERT INTO tracking (resi_number, order_id, current_status) VALUES ($1, $2, 'CREATED') RETURNING *`,
          [cleanResi, orderId]
        );
        const tracking = trackingRows[0];
        await client.query(
          `INSERT INTO tracking_history (tracking_id, status, description, location) VALUES ($1, 'CREATED', 'Paket siap', 'Gudang Pusat')`,
          [tracking.id]
        );
        await client.query('COMMIT');
        return resolvers.Query.trackingByResi(null, { resiNumber: cleanResi });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally { client.release(); }
    },
    updateTrackingStatus: async (parent, { resiNumber, status, description, location }) => {
      const cleanResi = resiNumber.trim().toUpperCase();
      const { rows } = await pool.query('SELECT * FROM tracking WHERE UPPER(resi_number) = $1', [cleanResi]);
      if (rows.length === 0) throw new Error("Tracking not found");

      const currentTracking = rows[0];
      if (!isValidStatusTransition(currentTracking.current_status, status)) {
        throw new Error(`Invalid transition: ${currentTracking.current_status} -> ${status}`);
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(`UPDATE tracking SET current_status = $1 WHERE id = $2`, [status, currentTracking.id]);
        await client.query(
          `INSERT INTO tracking_history (tracking_id, status, description, location) VALUES ($1, $2, $3, $4)`,
          [currentTracking.id, status, description, location]
        );
        await client.query('COMMIT');
        return resolvers.Query.trackingByResi(null, { resiNumber: cleanResi });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally { client.release(); }
    },
  },
};

module.exports = resolvers;