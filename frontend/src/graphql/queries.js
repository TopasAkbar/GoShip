import { gql } from '@apollo/client';

export const GET_SHIPMENTS = gql`
  query GetShipments {
    shipments {
      id
      orderId
      nomorResi
      alamatPengiriman
      alamatPenjemputan
      berat
      status
      ongkir
      metodePengiriman
      createdAt
    }
  }
`;

export const GET_SHIPMENT_BY_ORDER_ID = gql`
  query GetShipmentByOrderId($orderId: ID!) {
    shipmentByOrderId(orderId: $orderId) {
      id
      orderId
      nomorResi
      alamatPengiriman
      alamatPenjemputan
      berat
      status
      ongkir
      metodePengiriman
      createdAt
    }
  }
`;

export const GET_PROVINSI = gql`
  query GetProvinsi {
    provinsi {
      id
      nama
    }
  }
`;

export const GET_KOTA = gql`
  query GetKota($provinsiId: ID!) {
    kota(provinsiId: $provinsiId) {
      id
      nama
    }
  }
`;

export const GET_SHIPPING_OPTIONS = gql`
  query GetShippingOptions($kotaAsal: ID!, $kotaTujuan: ID!, $berat: Float!) {
    getShippingOptions(kotaAsal: $kotaAsal, kotaTujuan: $kotaTujuan, berat: $berat) {
      metodePengiriman
      hargaOngkir
      estimasiHari
    }
  }
`;

export const GET_TRACKING = gql`
  query GetTracking($resiNumber: String!) {
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

// --- [BARU] Query untuk Dropdown Kurir ---
export const GET_COURIERS = gql`
  query GetCouriers {
    couriers {
      id
      nama
      status
    }
  }
`;