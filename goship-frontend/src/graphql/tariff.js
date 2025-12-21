import { gql } from '@apollo/client';

export const GET_SHIPPING_COST = gql`
  query GetShippingCost($origin: String!, $destination: String!, $weight: Float!) {
    getShippingCost(origin: $origin, destination: $destination, weight: $weight) {
      origin
      destination
      weight
      price
      currency
    }
  }
`;




