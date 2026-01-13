const { pool } = require('./db');
const fetch = require('node-fetch');

const STATUS_ORDER = ['CREATED', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_AT_HUB', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const STATUS_DESCRIPTIONS = {
  CREATED: 'Paket telah dibuat dan siap untuk dijemput',
  PICKED_UP: 'Paket telah diambil oleh kurir',
  IN_TRANSIT: 'Paket sedang dalam perjalanan',
  ARRIVED_AT_HUB: 'Paket telah tiba di hub',
  OUT_FOR_DELIVERY: 'Paket sedang dikirim ke alamat tujuan',
  DELIVERED: 'Paket telah diterima oleh penerima'
};

const STATUS_LOCATIONS = {
  CREATED: 'Gudang Pusat',
  PICKED_UP: 'Gudang Pusat',
  IN_TRANSIT: 'Dalam Perjalanan',
  ARRIVED_AT_HUB: 'Hub Regional',
  OUT_FOR_DELIVERY: 'Hub Regional',
  DELIVERED: 'Alamat Tujuan'
};

const MANIFEST_SERVICE_URL =
  process.env.MANIFEST_SERVICE_URL || 'http://manifest-service:4005/graphql';

async function validateResiFromManifest(resiNumber) {
  const query = `
    query GetManifest($resiNumber: String!) {
      manifestByResi(resiNumber: $resiNumber) {
        id
        resiNumber
      }
    }
  `;

  const response = await fetch(MANIFEST_SERVICE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { resiNumber },
    }),
  });

  const result = await response.json();

  if (result.errors || !result.data || !result.data.manifestByResi) {
    throw new Error(`Resi number ${resiNumber} tidak valid di manifest service`);
  }

  return result.data.manifestByResi;
}

function isValidStatusTransition(currentStatus, newStatus) {
  // Tidak boleh update jika sudah DELIVERED
  if (currentStatus === 'DELIVERED') {
    return false;
  }

  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const newIndex = STATUS_ORDER.indexOf(newStatus);

  // Tidak boleh mundur
  if (newIndex <= currentIndex) return false;

  // Tidak boleh lompat lebih dari 2 langkah
  if (newIndex - currentIndex > 2) return false;

  return true;
}

const resolvers = {
  Query: {
    trackingByResi: async (parent, { resiNumber }) => {
      const cleanResi = resiNumber.trim().toUpperCase();

      // Query untuk tracking utama
      const { rows: trackingRows } = await pool.query(
        `SELECT * FROM tracking WHERE UPPER(resi_number) = $1`,
        [cleanResi]
      );

      if (trackingRows.length === 0) {
        throw new Error(`Tracking not found for resi number: ${resiNumber}`);
      }

      const tracking = trackingRows[0];

      // Query untuk history berdasarkan tracking_id
      const { rows: historyRows } = await pool.query(
        `SELECT * FROM tracking_history
         WHERE tracking_id = $1
         ORDER BY timestamp ASC`,
        [tracking.id]
      );

      return {
        id: tracking.id.toString(),
        resiNumber: tracking.resi_number,
        orderId: tracking.order_id,
        currentStatus: tracking.current_status,
        createdAt: tracking.created_at
          ? new Date(tracking.created_at).toISOString()
          : new Date().toISOString(),
        histories: historyRows.map(h => ({
          id: h.id.toString(),
          status: h.status,
          description: h.description || '',
          location: h.location || '',
          timestamp: h.timestamp
            ? new Date(h.timestamp).toISOString()
            : new Date().toISOString(),
        })),
      };
    },
  },

  Mutation: {
    createTracking: async (parent, { resiNumber, orderId }) => {
      const cleanResi = resiNumber.trim().toUpperCase();
      const client = await pool.connect();

      try {
        // 1) Validasi ke manifest service dulu
        await validateResiFromManifest(cleanResi);

        await client.query('BEGIN');

        // 2) Check if tracking already exists
        const checkRes = await client.query(
          'SELECT id FROM tracking WHERE UPPER(resi_number) = $1',
          [cleanResi]
        );

        if (checkRes.rows.length > 0) {
          throw new Error(`Tracking dengan resi number ${cleanResi} sudah ada`);
        }

        // 3) Insert tracking dengan status CREATED
        const { rows } = await client.query(
          `INSERT INTO tracking (resi_number, order_id, current_status)
           VALUES ($1, $2, 'CREATED')
           RETURNING *`,
          [cleanResi, orderId]
        );

        const tracking = rows[0];

        // 4) Otomatis buat history pertama
        await client.query(
          `INSERT INTO tracking_history (tracking_id, status, description, location)
           VALUES ($1, 'CREATED', $2, $3)`,
          [tracking.id, STATUS_DESCRIPTIONS.CREATED, STATUS_LOCATIONS.CREATED]
        );

        await client.query('COMMIT');

        // 5) Return tracking dengan histories via query existing
        return await resolvers.Query.trackingByResi(null, { resiNumber: cleanResi });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },

    updateTrackingStatus: async (parent, { resiNumber, status, description, location }) => {
      const cleanResi = resiNumber.trim().toUpperCase();
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Get current tracking
        const { rows } = await client.query(
          'SELECT * FROM tracking WHERE UPPER(resi_number) = $1 FOR UPDATE',
          [cleanResi]
        );

        if (rows.length === 0) {
          throw new Error(`Tracking not found for resi number: ${resiNumber}`);
        }

        const currentTracking = rows[0];

        // Validasi status transition
        if (!isValidStatusTransition(currentTracking.current_status, status)) {
          throw new Error(
            `Invalid status transition from ${currentTracking.current_status} to ${status}. ` +
              `Status tidak boleh mundur atau lompat lebih dari 2 langkah.`
          );
        }

        // Update status
        await client.query(
          `UPDATE tracking SET current_status = $1 WHERE id = $2`,
          [
            status,
            currentTracking.id,
          ]
        );

        // Insert history baru
        await client.query(
          `INSERT INTO tracking_history (tracking_id, status, description, location)
           VALUES ($1, $2, $3, $4)`,
          [
            currentTracking.id,
            status,
            description || STATUS_DESCRIPTIONS[status] || 'Status updated',
            location || STATUS_LOCATIONS[status] || 'Unknown location',
          ]
        );

        await client.query('COMMIT');

        // Return updated tracking
        return await resolvers.Query.trackingByResi(null, { resiNumber: cleanResi });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
  },
};

module.exports = resolvers;
