const { pool, generateResi } = require('./db');
const axios = require('axios');

const AREA_SERVICE_URL = process.env.AREA_SERVICE_URL || 'http://localhost:4002';
const TARIFF_SERVICE_URL = process.env.TARIFF_SERVICE_URL || 'http://localhost:4003';
const TRACKING_SERVICE_URL = process.env.TRACKING_SERVICE_URL || 'http://localhost:4006';
const MARKETPLACE_MODE = process.env.MARKETPLACE_MODE || 'SIMULATION';

const resolvers = {
  Query: {
    shipments: async () => {
      const { rows } = await pool.query('SELECT * FROM shipments ORDER BY created_at DESC');
      return rows.map(s => ({
        id: s.id.toString(),
        orderId: s.order_id,
        nomorResi: s.nomor_resi,
        alamatPengiriman: s.alamat_pengiriman,
        alamatPenjemputan: s.alamat_penjemputan,
        berat: parseFloat(s.berat),
        kotaAsal: s.kota_asal_id.toString(),
        kotaTujuan: s.kota_tujuan_id.toString(),
        status: s.status,
        ongkir: s.ongkir ? parseFloat(s.ongkir) : null,
        metodePengiriman: s.metode_pengiriman,
        createdAt: s.created_at.toISOString(),
        updatedAt: s.updated_at.toISOString(),
      }));
    },
    shipment: async (parent, { id }) => {
      const { rows } = await pool.query('SELECT * FROM shipments WHERE id = $1', [id]);
      if (rows.length === 0) return null;
      const s = rows[0];
      return {
        id: s.id.toString(),
        orderId: s.order_id,
        nomorResi: s.nomor_resi,
        alamatPengiriman: s.alamat_pengiriman,
        alamatPenjemputan: s.alamat_penjemputan,
        berat: parseFloat(s.berat),
        kotaAsal: s.kota_asal_id.toString(),
        kotaTujuan: s.kota_tujuan_id.toString(),
        status: s.status,
        ongkir: s.ongkir ? parseFloat(s.ongkir) : null,
        metodePengiriman: s.metode_pengiriman,
        createdAt: s.created_at.toISOString(),
        updatedAt: s.updated_at.toISOString(),
      };
    },
    shipmentByOrderId: async (parent, { orderId }) => {
      const { rows } = await pool.query('SELECT * FROM shipments WHERE order_id = $1', [orderId]);
      if (rows.length === 0) return null;
      const s = rows[0];
      return {
        id: s.id.toString(),
        orderId: s.order_id,
        nomorResi: s.nomor_resi,
        alamatPengiriman: s.alamat_pengiriman,
        alamatPenjemputan: s.alamat_penjemputan,
        berat: parseFloat(s.berat),
        kotaAsal: s.kota_asal_id.toString(),
        kotaTujuan: s.kota_tujuan_id.toString(),
        status: s.status,
        ongkir: s.ongkir ? parseFloat(s.ongkir) : null,
        metodePengiriman: s.metode_pengiriman,
        createdAt: s.created_at.toISOString(),
        updatedAt: s.updated_at.toISOString(),
      };
    },
  },
  Mutation: {
    createShipmentFromMarketplace: async (parent, { orderId, alamatPengiriman, alamatPenjemputan, berat, kotaAsal, kotaTujuan }) => {
      try {
        // Calculate ongkir from tariff service
        let ongkir = 0;
        let metodePengiriman = 'REGULER';
        try {
          const tariffResponse = await axios.post(`${TARIFF_SERVICE_URL}/graphql`, {
            query: `
              query {
                getShippingOptions(kotaAsal: "${kotaAsal}", kotaTujuan: "${kotaTujuan}", berat: ${berat}) {
                  metodePengiriman
                  hargaOngkir
                }
              }
            `,
          });
          if (tariffResponse.data.data?.getShippingOptions?.length > 0) {
            const option = tariffResponse.data.data.getShippingOptions[0];
            ongkir = option.hargaOngkir;
            metodePengiriman = option.metodePengiriman;
          }
        } catch (error) {
          console.error('Error calculating ongkir:', error.message);
          ongkir = Math.max(berat * 5000, 10000);
        }

        const { rows } = await pool.query(
          `INSERT INTO shipments (order_id, alamat_pengiriman, alamat_penjemputan, berat, kota_asal_id, kota_tujuan_id, status, ongkir, metode_pengiriman)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
          [orderId, alamatPengiriman, alamatPenjemputan, berat, kotaAsal, kotaTujuan, 'PENDING', ongkir, metodePengiriman]
        );

        const shipment = rows[0];
        return {
          id: shipment.id.toString(),
          orderId: shipment.order_id,
          nomorResi: shipment.nomor_resi,
          alamatPengiriman: shipment.alamat_pengiriman,
          alamatPenjemputan: shipment.alamat_penjemputan,
          berat: parseFloat(shipment.berat),
          kotaAsal: shipment.kota_asal_id.toString(),
          kotaTujuan: shipment.kota_tujuan_id.toString(),
          status: shipment.status,
          ongkir: parseFloat(shipment.ongkir),
          metodePengiriman: shipment.metode_pengiriman,
          createdAt: shipment.created_at.toISOString(),
          updatedAt: shipment.updated_at.toISOString(),
        };
      } catch (error) {
        if (error.code === '23505') {
          throw new Error('Order ID already exists');
        }
        throw error;
      }
    },
    requestResi: async (parent, { orderId }) => {
      const { rows } = await pool.query('SELECT * FROM shipments WHERE order_id = $1', [orderId]);
      
      if (rows.length === 0) {
        return {
          success: false,
          nomorResi: null,
          status: null,
          message: 'Order not found',
        };
      }

      const shipment = rows[0];
      
      if (shipment.nomor_resi) {
        return {
          success: true,
          nomorResi: shipment.nomor_resi,
          status: shipment.status,
          message: 'Resi already generated',
        };
      }

      // Generate resi
      const nomorResi = generateResi();
      const { rows: updated } = await pool.query(
        'UPDATE shipments SET nomor_resi = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE order_id = $3 RETURNING *',
        [nomorResi, 'PICKUP', orderId]
      );

      // Create tracking in Tracking Service
      try {
        await axios.post(`${TRACKING_SERVICE_URL}/graphql`, {
          query: `
            mutation($resiNumber: String!, $orderId: ID!) {
              createTracking(resiNumber: $resiNumber, orderId: $orderId) {
                id
                resiNumber
                currentStatus
              }
            }
          `,
          variables: {
            resiNumber: nomorResi,
            orderId: orderId,
          },
        });
      } catch (error) {
        console.error('Error creating tracking:', error.message);
        // Continue even if tracking creation fails
      }

      return {
        success: true,
        nomorResi,
        status: updated[0].status,
        message: 'Resi generated successfully',
      };
    },
    updateShipmentStatus: async (parent, { id, status }) => {
      const { rows } = await pool.query(
        'UPDATE shipments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [status, id]
      );
      if (rows.length === 0) {
        throw new Error('Shipment not found');
      }
      const s = rows[0];
      return {
        id: s.id.toString(),
        orderId: s.order_id,
        nomorResi: s.nomor_resi,
        alamatPengiriman: s.alamat_pengiriman,
        alamatPenjemputan: s.alamat_penjemputan,
        berat: parseFloat(s.berat),
        kotaAsal: s.kota_asal_id.toString(),
        kotaTujuan: s.kota_tujuan_id.toString(),
        status: s.status,
        ongkir: s.ongkir ? parseFloat(s.ongkir) : null,
        metodePengiriman: s.metode_pengiriman,
        createdAt: s.created_at.toISOString(),
        updatedAt: s.updated_at.toISOString(),
      };
    },
  },
};

module.exports = resolvers;



