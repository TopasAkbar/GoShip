import { gql } from '@apollo/client';

export const GET_COURIERS = gql`
  query GetCouriers($isActive: Boolean) {
    getCouriers(isActive: $isActive) {
      id
      name
      phone
      vehicleType
      isActive
    }
  }
`;

export const ADD_COURIER = gql`
  mutation AddCourier($input: CourierInput!) {
    addCourier(input: $input) {
      id
      name
      phone
      vehicleType
      isActive
    }
  }
`;

export const UPDATE_COURIER_STATUS = gql`
  mutation UpdateCourierStatus($id: Int!, $isActive: Boolean!) {
    updateCourierStatus(id: $id, isActive: $isActive) {
      id
      name
      phone
      vehicleType
      isActive
    }
  }
`;




