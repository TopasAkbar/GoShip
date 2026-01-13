const { pool, generateResi } = require('./db');
const axios = require('axios');

// --- PERBAIKAN URL SERVICE ---
// Menggunakan nama service Docker (courier-service) bukan localhost
// Pastikan portnya 4005 (port default courier-service), bukan 4004 (port manifest)
const AREA_SERVICE_URL = process.env.AREA_SERVICE_URL || 'http://area-service:4002';
const TARIFF_SERVICE_URL = process.env.TARIFF_SERVICE_URL || 'http://tariff-service:4003';
const TRACKING_SERVICE_URL = process.env.TRACKING_SERVICE_URL || 'http://tracking-service:4006';
const COURIER_SERVICE_URL = process.env.COURIER_SERVICE_URL || 'http://courier-service:4005'; 
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
    createShipmentFromMarketplace: async (parent, { orderId, alamatPengiriman, alamatPenjemputan, berat, kotaAsal, kotaTujuan, courierId }) => {
      try {
        
        // ---------------------------------------------------------
        // 1. CEK KONEKSI KE COURIER SERVICE & STATUS KURIR
        // ---------------------------------------------------------
        if (courierId) {
            console.log(`🔍 Memeriksa status kurir ID: ${courierId} ke Courier Service (${COURIER_SERVICE_URL})...`);
            try {
                const courierResponse = await axios.post(`${COURIER_SERVICE_URL}/graphql`, {
                    query: `
                        query CekStatusKurir($id: ID!) {
                            courier(id: $id) {
                                id
                                nama
                                status
                            }
                        }
                    `,
                    variables: { id: courierId }
                });

                // Periksa apakah ada errors dari GraphQL (misal ID tidak ketemu)
                if (courierResponse.data.errors) {
                    throw new Error(courierResponse.data.errors[0].message);
                }

                const courierData = courierResponse.data.data?.courier;

                // Validasi: Apakah kurir ditemukan?
                if (!courierData) {
                    throw new Error(`Kurir dengan ID ${courierId} tidak ditemukan.`);
                }

                // Validasi: Apakah status kurir Aktif/Available?
                const validStatuses = ['AVAILABLE', 'AKTIF', 'IDLE'];
                if (!validStatuses.includes(courierData.status)) { 
                    throw new Error(`Kurir ${courierData.nama} sedang tidak aktif (Status: ${courierData.status}).`);
                }

                console.log(`✅ Kurir Valid: ${courierData.nama} (Status: ${courierData.status}) siap menjemput.`);

            } catch (err) {
                // Jika errornya karena koneksi putus (Service Mati atau Salah URL)
                if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
                    console.error("Connection Error Detail:", err.message);
                    throw new Error(`🚨 Gagal menghubungi Courier Service di ${COURIER_SERVICE_URL}. Pastikan service aktif dan URL benar.`);
                }
                throw err;
            }
        }

        // ---------------------------------------------------------
        // 2. Hitung Ongkir
        // ---------------------------------------------------------
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
          console.error('Error calculating ongkir (menggunakan default):', error.message);
          ongkir = Math.max(berat * 5000, 10000);
        }

        // ---------------------------------------------------------
        // 3. Generate Resi
        // ---------------------------------------------------------
        const nomorResi = generateResi();

        // ---------------------------------------------------------
        // 4. Insert ke DB
        // ---------------------------------------------------------
        const { rows } = await pool.query(
          `INSERT INTO shipments (order_id, alamat_pengiriman, alamat_penjemputan, berat, kota_asal_id, kota_tujuan_id, status, ongkir, metode_pengiriman, nomor_resi, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP) RETURNING *`,
          [orderId, alamatPengiriman, alamatPenjemputan, berat, kotaAsal, kotaTujuan, 'PICKUP', ongkir, metodePengiriman, nomorResi]
        );

        const shipment = rows[0];

        // ---------------------------------------------------------
        // 5. Buat Tracking di Tracking Service
        // ---------------------------------------------------------
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
        }

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
          console.log("⚠️ Order ID exists. Fetching existing data...");
          const { rows } = await pool.query('SELECT * FROM shipments WHERE order_id = $1', [orderId]);
          if(rows.length > 0) {
             const existing = rows[0];
             return {
                id: existing.id.toString(),
                orderId: existing.order_id,
                nomorResi: existing.nomor_resi,
                alamatPengiriman: existing.alamat_pengiriman,
                alamatPenjemputan: existing.alamat_penjemputan,
                berat: parseFloat(existing.berat),
                kotaAsal: existing.kota_asal_id.toString(),
                kotaTujuan: existing.kota_tujuan_id.toString(),
                status: existing.status,
                ongkir: existing.ongkir ? parseFloat(existing.ongkir) : null,
                metodePengiriman: existing.metode_pengiriman,
                createdAt: existing.created_at.toISOString(),
                updatedAt: existing.updated_at.toISOString(),
             }
          }
          throw new Error('Order ID already exists');
        }
        throw error;
      }
    },

    requestResi: async (parent, { orderId }) => {
      const { rows } = await pool.query('SELECT * FROM shipments WHERE order_id = $1', [orderId]);
      
      if (rows.length === 0) {
        return { success: false, nomorResi: null, status: null, message: 'Order not found' };
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

      const nomorResi = generateResi();
      const { rows: updated } = await pool.query(
        'UPDATE shipments SET nomor_resi = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE order_id = $3 RETURNING *',
        [nomorResi, 'PICKUP', orderId]
      );

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