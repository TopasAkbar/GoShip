import { gql } from '@apollo/client';

export const GET_COVERED_AREAS = gql`
  query GetCoveredAreas($isActive: Boolean) {
    getCoveredAreas(isActive: $isActive) {
      id
      province
      city
      district
      isActive
    }
  }
`;

export const ADD_COVERED_AREA = gql`
  mutation AddCoveredArea($input: CoveredAreaInput!) {
    addCoveredArea(input: $input) {
      id
      province
      city
      district
      isActive
    }
  }
`;




