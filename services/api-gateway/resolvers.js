const axios = require('axios');
const jwt = require('jsonwebtoken');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
const AREA_SERVICE_URL = process.env.AREA_SERVICE_URL || 'http://localhost:4002';
const TARIFF_SERVICE_URL = process.env.TARIFF_SERVICE_URL || 'http://localhost:4003';
const MANIFEST_SERVICE_URL = process.env.MANIFEST_SERVICE_URL || 'http://localhost:4004';
const COURIER_SERVICE_URL = process.env.COURIER_SERVICE_URL || 'http://localhost:4005';
const TRACKING_SERVICE_URL = process.env.TRACKING_SERVICE_URL || 'http://localhost:4006';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Helper function to forward GraphQL requests
async function forwardRequest(serviceUrl, query, variables = {}, token = null) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.post(
      `${serviceUrl}/graphql`,
      { query, variables },
      { headers }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data;
  } catch (error) {
    console.error(`Error forwarding to ${serviceUrl}:`, error.message);
    throw error;
  }
}

// JWT verification middleware
function verifyToken(token) {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

const resolvers = {
  Query: {
    // Auth
    me: async (parent, args, context) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const query = `
        query {
          me {
            id
            username
            role
            createdAt
          }
        }
      `;
      const data = await forwardRequest(AUTH_SERVICE_URL, query, {}, context.token);
      return data.me;
    },
    // Area
    provinsi: async (parent, args, context) => {
      const query = `
        query {
          provinsi {
            id
            nama
          }
        }
      `;
      const data = await forwardRequest(AREA_SERVICE_URL, query);
      return data.provinsi;
    },
    kota: async (parent, args, context) => {
      const query = `
        query($provinsiId: ID!) {
          kota(provinsiId: $provinsiId) {
            id
            nama
            provinsiId
          }
        }
      `;
      const data = await forwardRequest(AREA_SERVICE_URL, query, { provinsiId: args.provinsiId });
      return data.kota;
    },
    kecamatan: async (parent, args, context) => {
      const query = `
        query($kotaId: ID!) {
          kecamatan(kotaId: $kotaId) {
            id
            nama
            kodePos
            kotaId
          }
        }
      `;
      const data = await forwardRequest(AREA_SERVICE_URL, query, { kotaId: args.kotaId });
      return data.kecamatan;
    },
    validateKodePos: async (parent, args, context) => {
      const query = `
        query($kodePos: String!) {
          validateKodePos(kodePos: $kodePos) {
            valid
            kecamatan {
              id
              nama
              kodePos
              kotaId
            }
            message
          }
        }
      `;
      const data = await forwardRequest(AREA_SERVICE_URL, query, { kodePos: args.kodePos });
      return data.validateKodePos;
    },
    // Tariff
    calculateOngkir: async (parent, args, context) => {
      const query = `
        query($kotaAsal: ID!, $kotaTujuan: ID!, $berat: Float!) {
          calculateOngkir(kotaAsal: $kotaAsal, kotaTujuan: $kotaTujuan, berat: $berat) {
            totalOngkir
            breakdown {
              metodePengiriman
              harga
              estimasiHari
            }
          }
        }
      `;
      const data = await forwardRequest(TARIFF_SERVICE_URL, query, {
        kotaAsal: args.kotaAsal,
        kotaTujuan: args.kotaTujuan,
        berat: args.berat,
      });
      return data.calculateOngkir;
    },
    getShippingOptions: async (parent, args, context) => {
      const query = `
        query($kotaAsal: ID!, $kotaTujuan: ID!, $berat: Float!) {
          getShippingOptions(kotaAsal: $kotaAsal, kotaTujuan: $kotaTujuan, berat: $berat) {
            metodePengiriman
            hargaOngkir
            estimasiHari
          }
        }
      `;
      const data = await forwardRequest(TARIFF_SERVICE_URL, query, {
        kotaAsal: args.kotaAsal,
        kotaTujuan: args.kotaTujuan,
        berat: args.berat,
      });
      return data.getShippingOptions;
    },
    // Manifest
    shipments: async (parent, args, context) => {
      const query = `
        query {
          shipments {
            id
            orderId
            nomorResi
            alamatPengiriman
            alamatPenjemputan
            berat
            kotaAsal
            kotaTujuan
            status
            ongkir
            metodePengiriman
            createdAt
            updatedAt
          }
        }
      `;
      const data = await forwardRequest(MANIFEST_SERVICE_URL, query, {}, context.token);
      return data.shipments;
    },
    shipment: async (parent, args, context) => {
      const query = `
        query($id: ID!) {
          shipment(id: $id) {
            id
            orderId
            nomorResi
            alamatPengiriman
            alamatPenjemputan
            berat
            kotaAsal
            kotaTujuan
            status
            ongkir
            metodePengiriman
            createdAt
            updatedAt
          }
        }
      `;
      const data = await forwardRequest(MANIFEST_SERVICE_URL, query, { id: args.id }, context.token);
      return data.shipment;
    },
    shipmentByOrderId: async (parent, args, context) => {
      const query = `
        query($orderId: ID!) {
          shipmentByOrderId(orderId: $orderId) {
            id
            orderId
            nomorResi
            alamatPengiriman
            alamatPenjemputan
            berat
            kotaAsal
            kotaTujuan
            status
            ongkir
            metodePengiriman
            createdAt
            updatedAt
          }
        }
      `;
      const data = await forwardRequest(MANIFEST_SERVICE_URL, query, { orderId: args.orderId }, context.token);
      return data.shipmentByOrderId;
    },
    // Courier
    couriers: async (parent, args, context) => {
      const query = `
        query {
          couriers {
            id
            nama
            noHp
            kendaraan
            status
            createdAt
            updatedAt
          }
        }
      `;
      const data = await forwardRequest(COURIER_SERVICE_URL, query, {}, context.token);
      return data.couriers;
    },
    courier: async (parent, args, context) => {
      const query = `
        query($id: ID!) {
          courier(id: $id) {
            id
            nama
            noHp
            kendaraan
            status
            createdAt
            updatedAt
          }
        }
      `;
      const data = await forwardRequest(COURIER_SERVICE_URL, query, { id: args.id }, context.token);
      return data.courier;
    },
    // Tracking
    trackingByResi: async (parent, args, context) => {
      const query = `
        query($resiNumber: String!) {
          trackingByResi(resiNumber: $resiNumber) {
            id
            resiNumber
            orderId
            currentStatus
            createdAt
            histories {
              id
              status
              description
              location
              timestamp
            }
          }
        }
      `;
      const data = await forwardRequest(TRACKING_SERVICE_URL, query, { resiNumber: args.resiNumber });
      return data.trackingByResi;
    },
  },
  Mutation: {
    // Auth
    login: async (parent, args, context) => {
      const query = `
        mutation($username: String!, $password: String!) {
          login(username: $username, password: $password) {
            success
            token
            admin {
              id
              username
              role
              createdAt
            }
            message
          }
        }
      `;
      const data = await forwardRequest(AUTH_SERVICE_URL, query, {
        username: args.username,
        password: args.password,
      });
      return data.login;
    },
    register: async (parent, args, context) => {
      const query = `
        mutation($username: String!, $password: String!) {
          register(username: $username, password: $password) {
            success
            token
            admin {
              id
              username
              role
              createdAt
            }
            message
          }
        }
      `;
      const data = await forwardRequest(AUTH_SERVICE_URL, query, {
        username: args.username,
        password: args.password,
      });
      return data.register;
    },
    // Area
    createProvinsi: async (parent, args, context) => {
      if (!context.user) throw new Error('Unauthorized');
      const query = `
        mutation($nama: String!) {
          createProvinsi(nama: $nama) {
            id
            nama
          }
        }
      `;
      const data = await forwardRequest(AREA_SERVICE_URL, query, { nama: args.nama }, context.token);
      return data.createProvinsi;
    },
    createKota: async (parent, args, context) => {
      if (!context.user) throw new Error('Unauthorized');
      const query = `
        mutation($provinsiId: ID!, $nama: String!) {
          createKota(provinsiId: $provinsiId, nama: $nama) {
            id
            nama
            provinsiId
          }
        }
      `;
      const data = await forwardRequest(AREA_SERVICE_URL, query, {
        provinsiId: args.provinsiId,
        nama: args.nama,
      }, context.token);
      return data.createKota;
    },
    createKecamatan: async (parent, args, context) => {
      if (!context.user) throw new Error('Unauthorized');
      const query = `
        mutation($kotaId: ID!, $nama: String!, $kodePos: String!) {
          createKecamatan(kotaId: $kotaId, nama: $nama, kodePos: $kodePos) {
            id
            nama
            kodePos
            kotaId
          }
        }
      `;
      const data = await forwardRequest(AREA_SERVICE_URL, query, {
        kotaId: args.kotaId,
        nama: args.nama,
        kodePos: args.kodePos,
      }, context.token);
      return data.createKecamatan;
    },
    // Tariff
    createTariff: async (parent, args, context) => {
      if (!context.user) throw new Error('Unauthorized');
      const query = `
        mutation($kotaAsal: ID!, $kotaTujuan: ID!, $metodePengiriman: String!, $hargaPerKg: Float!, $hargaMinimum: Float!) {
          createTariff(kotaAsal: $kotaAsal, kotaTujuan: $kotaTujuan, metodePengiriman: $metodePengiriman, hargaPerKg: $hargaPerKg, hargaMinimum: $hargaMinimum) {
            id
            kotaAsal
            kotaTujuan
            metodePengiriman
            hargaPerKg
            hargaMinimum
            createdAt
          }
        }
      `;
      const data = await forwardRequest(TARIFF_SERVICE_URL, query, {
        kotaAsal: args.kotaAsal,
        kotaTujuan: args.kotaTujuan,
        metodePengiriman: args.metodePengiriman,
        hargaPerKg: args.hargaPerKg,
        hargaMinimum: args.hargaMinimum,
      }, context.token);
      return data.createTariff;
    },
    // Manifest
    createShipmentFromMarketplace: async (parent, args, context) => {
      const query = `
        mutation($orderId: ID!, $alamatPengiriman: String!, $alamatPenjemputan: String!, $berat: Float!, $kotaAsal: ID!, $kotaTujuan: ID!) {
          createShipmentFromMarketplace(
            orderId: $orderId
            alamatPengiriman: $alamatPengiriman
            alamatPenjemputan: $alamatPenjemputan
            berat: $berat
            kotaAsal: $kotaAsal
            kotaTujuan: $kotaTujuan
          ) {
            id
            orderId
            nomorResi
            alamatPengiriman
            alamatPenjemputan
            berat
            kotaAsal
            kotaTujuan
            status
            ongkir
            metodePengiriman
            createdAt
            updatedAt
          }
        }
      `;
      const data = await forwardRequest(MANIFEST_SERVICE_URL, query, {
        orderId: args.orderId,
        alamatPengiriman: args.alamatPengiriman,
        alamatPenjemputan: args.alamatPenjemputan,
        berat: args.berat,
        kotaAsal: args.kotaAsal,
        kotaTujuan: args.kotaTujuan,
      }, context.token);
      return data.createShipmentFromMarketplace;
    },
    requestResi: async (parent, args, context) => {
      if (!context.user) throw new Error('Unauthorized');
      const query = `
        mutation($orderId: ID!) {
          requestResi(orderId: $orderId) {
            success
            nomorResi
            status
            message
          }
        }
      `;
      const data = await forwardRequest(MANIFEST_SERVICE_URL, query, { orderId: args.orderId }, context.token);
      return data.requestResi;
    },
    updateShipmentStatus: async (parent, args, context) => {
      if (!context.user) throw new Error('Unauthorized');
      const query = `
        mutation($id: ID!, $status: String!) {
          updateShipmentStatus(id: $id, status: $status) {
            id
            orderId
            nomorResi
            alamatPengiriman
            alamatPenjemputan
            berat
            kotaAsal
            kotaTujuan
            status
            ongkir
            metodePengiriman
            createdAt
            updatedAt
          }
        }
      `;
      const data = await forwardRequest(MANIFEST_SERVICE_URL, query, {
        id: args.id,
        status: args.status,
      }, context.token);
      return data.updateShipmentStatus;
    },
    // Courier
    createCourier: async (parent, args, context) => {
      if (!context.user) throw new Error('Unauthorized');
      const query = `
        mutation($nama: String!, $noHp: String!, $kendaraan: String!) {
          createCourier(nama: $nama, noHp: $noHp, kendaraan: $kendaraan) {
            id
            nama
            noHp
            kendaraan
            status
            createdAt
            updatedAt
          }
        }
      `;
      const data = await forwardRequest(COURIER_SERVICE_URL, query, {
        nama: args.nama,
        noHp: args.noHp,
        kendaraan: args.kendaraan,
      }, context.token);
      return data.createCourier;
    },
    updateCourier: async (parent, args, context) => {
      if (!context.user) throw new Error('Unauthorized');
      const query = `
        mutation($id: ID!, $nama: String, $noHp: String, $kendaraan: String, $status: String) {
          updateCourier(id: $id, nama: $nama, noHp: $noHp, kendaraan: $kendaraan, status: $status) {
            id
            nama
            noHp
            kendaraan
            status
            createdAt
            updatedAt
          }
        }
      `;
      const data = await forwardRequest(COURIER_SERVICE_URL, query, {
        id: args.id,
        nama: args.nama,
        noHp: args.noHp,
        kendaraan: args.kendaraan,
        status: args.status,
      }, context.token);
      return data.updateCourier;
    },
    deleteCourier: async (parent, args, context) => {
      if (!context.user) throw new Error('Unauthorized');
      const query = `
        mutation($id: ID!) {
          deleteCourier(id: $id)
        }
      `;
      const data = await forwardRequest(COURIER_SERVICE_URL, query, { id: args.id }, context.token);
      return data.deleteCourier;
    },
    // Tracking
    createTracking: async (parent, args, context) => {
      if (!context.user) throw new Error('Unauthorized');
      const query = `
        mutation($resiNumber: String!, $orderId: ID!) {
          createTracking(resiNumber: $resiNumber, orderId: $orderId) {
            id
            resiNumber
            orderId
            currentStatus
            createdAt
            histories {
              id
              status
              description
              location
              timestamp
            }
          }
        }
      `;
      const data = await forwardRequest(TRACKING_SERVICE_URL, query, {
        resiNumber: args.resiNumber,
        orderId: args.orderId,
      }, context.token);
      return data.createTracking;
    },
    updateTrackingStatus: async (parent, args, context) => {
      if (!context.user) throw new Error('Unauthorized');
      const query = `
        mutation($resiNumber: String!, $status: TrackingStatus!, $description: String!, $location: String!) {
          updateTrackingStatus(
            resiNumber: $resiNumber
            status: $status
            description: $description
            location: $location
          ) {
            id
            resiNumber
            orderId
            currentStatus
            createdAt
            histories {
              id
              status
              description
              location
              timestamp
            }
          }
        }
      `;
      const data = await forwardRequest(TRACKING_SERVICE_URL, query, {
        resiNumber: args.resiNumber,
        status: args.status,
        description: args.description,
        location: args.location,
      }, context.token);
      return data.updateTrackingStatus;
    },
  },
};

module.exports = resolvers;



