import { gql } from '@apollo/client';

export const AVERAGE_DELIVERY_TIME_BY_AREA = gql`
  query AverageDeliveryTimeByArea($area: String!) {
    averageDeliveryTimeByArea(area: $area) {
      area
      averageDays
      totalShipments
    }
  }
`;

export const COURIER_PERFORMANCE = gql`
  query CourierPerformance($courierId: Int) {
    courierPerformance(courierId: $courierId) {
      courierId
      courierName
      totalDeliveries
      successRate
      averageDeliveryTime
    }
  }
`;

export const SHIPMENT_VOLUME = gql`
  query ShipmentVolume($startDate: String, $endDate: String) {
    shipmentVolume(startDate: $startDate, endDate: $endDate) {
      totalShipments
      period
      byStatus {
        status
        count
      }
    }
  }
`;

export const DELIVERY_FAILURE_RATE = gql`
  query DeliveryFailureRate($area: String) {
    deliveryFailureRate(area: $area) {
      area
      failureRate
      totalShipments
      failedShipments
    }
  }
`;




