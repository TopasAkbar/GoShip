import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      success
      token
      admin {
        id
        username
        role
      }
      message
    }
  }
`;

export const CREATE_SHIPMENT = gql`
  mutation CreateShipmentFromMarketplace(
    $orderId: ID!
    $alamatPengiriman: String!
    $alamatPenjemputan: String!
    $berat: Float!
    $kotaAsal: ID!
    $kotaTujuan: ID!
  ) {
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
      status
      ongkir
      metodePengiriman
      createdAt
    }
  }
`;

export const REQUEST_RESI = gql`
  mutation RequestResi($orderId: ID!) {
    requestResi(orderId: $orderId) {
      success
      nomorResi
      status
      message
    }
  }
`;

export const CREATE_TRACKING = gql`
  mutation CreateTracking($resiNumber: String!, $orderId: ID!) {
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

export const UPDATE_TRACKING_STATUS = gql`
  mutation UpdateTrackingStatus(
    $resiNumber: String!
    $status: TrackingStatus!
    $description: String!
    $location: String!
  ) {
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