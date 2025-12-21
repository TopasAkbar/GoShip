import { gql } from '@apollo/client';

export const GENERATE_MANIFEST = gql`
  mutation GenerateManifest($orderId: String!, $destination: String!) {
    generateManifest(orderId: $orderId, destination: $destination) {
      id
      orderId
      trackingNumber
      barcode
      createdAt
    }
  }
`;




