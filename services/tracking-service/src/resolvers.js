const ShipmentStatus = require('./models/ShipmentStatus');

const resolvers = {
  Query: {
    trackPackage: async (_, { trackingNumber }) => {
      try {
        const shipment = await ShipmentStatus.findOne({
          where: {
            tracking_number: trackingNumber,
          },
        });

        if (!shipment) {
          throw new Error(`Package with tracking number ${trackingNumber} not found`);
        }

        return {
          trackingNumber: shipment.tracking_number,
          status: shipment.status,
          location: shipment.location,
          updatedAt: shipment.updated_at.toISOString(),
        };
      } catch (error) {
        throw new Error(`Error tracking package: ${error.message}`);
      }
    },
  },
};

module.exports = resolvers;





