const {
  DeliveryPerformance,
  CourierMetrics,
  AreaStatistics,
  ShipmentStatus,
  Courier,
  ManifestLog,
} = require('./models');
const { Op } = require('sequelize');

const resolvers = {
  Query: {
    averageDeliveryTimeByArea: async (_, { area }) => {
      try {
        const performance = await DeliveryPerformance.findOne({
          where: { area: area.toUpperCase() },
        });

        if (!performance) {
          // Return default if not found
          return {
            area: area,
            averageDays: 0,
            totalShipments: 0,
          };
        }

        return {
          area: performance.area,
          averageDays: performance.average_days,
          totalShipments: performance.total_shipments,
        };
      } catch (error) {
        throw new Error(`Error fetching delivery time: ${error.message}`);
      }
    },

    courierPerformance: async (_, { courierId }) => {
      try {
        const where = {};
        if (courierId) {
          where.courier_id = courierId;
        }

        const metrics = await CourierMetrics.findAll({ where });

        return metrics.map(metric => ({
          courierId: metric.courier_id,
          courierName: metric.courier_name,
          totalDeliveries: metric.total_deliveries,
          successRate: metric.success_rate,
          averageDeliveryTime: metric.average_delivery_time,
        }));
      } catch (error) {
        throw new Error(`Error fetching courier performance: ${error.message}`);
      }
    },

    shipmentVolume: async (_, { startDate, endDate }) => {
      try {
        // Get all shipments from manifest
        const where = {};
        if (startDate && endDate) {
          where.created_at = {
            [Op.between]: [new Date(startDate), new Date(endDate)],
          };
        }

        const manifests = await ManifestLog.findAll({ where });
        const totalShipments = manifests.length;

        // Get status counts from tracking service
        const trackingNumbers = manifests.map(m => m.tracking_number);
        const shipments = await ShipmentStatus.findAll({
          where: {
            tracking_number: {
              [Op.in]: trackingNumbers,
            },
          },
        });

        const statusCounts = {};
        shipments.forEach(shipment => {
          statusCounts[shipment.status] = (statusCounts[shipment.status] || 0) + 1;
        });

        const byStatus = Object.entries(statusCounts).map(([status, count]) => ({
          status,
          count,
        }));

        return {
          totalShipments,
          period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time',
          byStatus,
        };
      } catch (error) {
        throw new Error(`Error fetching shipment volume: ${error.message}`);
      }
    },

    deliveryFailureRate: async (_, { area }) => {
      try {
        const where = {};
        if (area) {
          where.area = area.toUpperCase();
        }

        const statistics = area
          ? await AreaStatistics.findOne({ where })
          : await AreaStatistics.findAll();

        if (area) {
          if (!statistics) {
            return {
              area: area,
              failureRate: 0,
              totalShipments: 0,
              failedShipments: 0,
            };
          }

          return {
            area: statistics.area,
            failureRate: statistics.failure_rate,
            totalShipments: statistics.total_shipments,
            failedShipments: statistics.failed_shipments,
          };
        } else {
          // Aggregate all areas
          const total = statistics.reduce((acc, stat) => ({
            totalShipments: acc.totalShipments + stat.total_shipments,
            failedShipments: acc.failedShipments + stat.failed_shipments,
          }), { totalShipments: 0, failedShipments: 0 });

          return {
            area: null,
            failureRate: total.totalShipments > 0
              ? (total.failedShipments / total.totalShipments) * 100
              : 0,
            totalShipments: total.totalShipments,
            failedShipments: total.failedShipments,
          };
        }
      } catch (error) {
        throw new Error(`Error fetching failure rate: ${error.message}`);
      }
    },
  },
};

module.exports = resolvers;





