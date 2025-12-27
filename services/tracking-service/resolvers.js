const { pool } = require('./db');

const STATUS_ORDER = ['CREATED', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_AT_HUB', 'OUT_FOR_DELIVERY', 'DELIVERED'];

// Default descriptions untuk setiap status
const STATUS_DESCRIPTIONS = {
  CREATED: 'Paket telah dibuat dan siap untuk dijemput',
  PICKED_UP: 'Paket telah diambil oleh kurir',
  IN_TRANSIT: 'Paket sedang dalam perjalanan',
  ARRIVED_AT_HUB: 'Paket telah tiba di hub',
  OUT_FOR_DELIVERY: 'Paket sedang dikirim ke alamat tujuan',
  DELIVERED: 'Paket telah diterima oleh penerima'
};

// Default locations untuk setiap status
const STATUS_LOCATIONS = {
  CREATED: 'Gudang Pusat',
  PICKED_UP: 'Gudang Pusat',
  IN_TRANSIT: 'Dalam Perjalanan',
  ARRIVED_AT_HUB: 'Hub Regional',
  OUT_FOR_DELIVERY: 'Hub Regional',
  DELIVERED: 'Alamat Tujuan'
};

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
        `SELECT * FROM tracking WHERE UPPER(nomor_resi) = $1`,
        [cleanResi]
      );

      if (trackingRows.length === 0) {
        throw new Error(`Tracking not found for resi number: ${resiNumber}`);
      }

      const tracking = trackingRows[0];
      
      // Query untuk history berdasarkan nomor_resi
      const { rows: historyRows } = await pool.query(
        `SELECT * FROM tracking_history 
         WHERE UPPER(nomor_resi) = $1 
         ORDER BY created_at ASC`,
        [cleanResi]
      );

      return {
        id: tracking.id.toString(),
        resiNumber: tracking.nomor_resi,
        orderId: tracking.id.toString(), // Fallback karena tidak ada order_id di schema
        currentStatus: tracking.status,
        createdAt: tracking.created_at ? new Date(tracking.created_at).toISOString() : new Date().toISOString(),
        histories: historyRows.map(h => ({
          id: h.id.toString(),
          status: h.status,
          description: h.keterangan || '',
          location: h.lokasi || '',
          timestamp: h.created_at ? new Date(h.created_at).toISOString() : new Date().toISOString(),
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
        
        // Check if tracking already exists
        const checkRes = await client.query(
          'SELECT id FROM tracking WHERE UPPER(nomor_resi) = $1',
          [cleanResi]
        );
        
        if (checkRes.rows.length > 0) {
          throw new Error(`Tracking dengan resi number ${cleanResi} sudah ada`);
        }
        
        // Insert tracking dengan status CREATED (menggunakan schema yang ada)
        const { rows } = await client.query(
          `INSERT INTO tracking (nomor_resi, status, lokasi, keterangan) 
           VALUES ($1, 'CREATED', $2, $3) 
           RETURNING *`,
          [cleanResi, STATUS_LOCATIONS.CREATED, STATUS_DESCRIPTIONS.CREATED]
        );
        
        const tracking = rows[0];
        
        // Otomatis buat history pertama dengan timestamp dari server
        await client.query(
          `INSERT INTO tracking_history (nomor_resi, status, lokasi, keterangan) 
           VALUES ($1, 'CREATED', $2, $3)`,
          [
            cleanResi,
            STATUS_LOCATIONS.CREATED,
            STATUS_DESCRIPTIONS.CREATED
          ]
        );
        
        await client.query('COMMIT');
        
        // Return tracking dengan histories
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
          'SELECT * FROM tracking WHERE UPPER(nomor_resi) = $1 FOR UPDATE',
          [cleanResi]
        );
        
        if (rows.length === 0) {
          throw new Error(`Tracking not found for resi number: ${resiNumber}`);
        }

        const currentTracking = rows[0];
        
        // Validasi status transition
        if (!isValidStatusTransition(currentTracking.status, status)) {
          throw new Error(
            `Invalid status transition from ${currentTracking.status} to ${status}. ` +
            `Status tidak boleh mundur atau lompat lebih dari 2 langkah.`
          );
        }
        
        // Update status (menggunakan schema yang ada)
        await client.query(
          `UPDATE tracking SET status = $1, lokasi = $2, keterangan = $3 WHERE id = $4`,
          [
            status,
            location || STATUS_LOCATIONS[status] || 'Unknown location',
            description || STATUS_DESCRIPTIONS[status] || 'Status updated',
            currentTracking.id
          ]
        );
        
        // Insert history baru dengan timestamp dari server (DEFAULT CURRENT_TIMESTAMP)
        await client.query(
          `INSERT INTO tracking_history (nomor_resi, status, lokasi, keterangan) 
           VALUES ($1, $2, $3, $4)`,
          [
            cleanResi,
            status,
            location || STATUS_LOCATIONS[status] || 'Unknown location',
            description || STATUS_DESCRIPTIONS[status] || 'Status updated'
          ]
        );
        
        await client.query('COMMIT');
        
        // Return updated tracking dengan histories
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