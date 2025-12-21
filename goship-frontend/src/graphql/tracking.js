import { gql } from '@apollo/client';

export const TRACK_PACKAGE = gql`
  query TrackPackage($trackingNumber: String!) {
    trackPackage(trackingNumber: $trackingNumber) {
      trackingNumber
      status
      location
      updatedAt
    }
  }
`;




