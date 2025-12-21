const Courier = require('./models/Courier');
const { Op } = require('sequelize');

const resolvers = {
  Query: {
    getCouriers: async (_, { isActive }) => {
      try {
        const where = {};
        if (isActive !== undefined && isActive !== null) {
          where.is_active = isActive;
        }

        const couriers = await Courier.findAll({ where });
        return couriers.map(courier => ({
          id: courier.id,
          name: courier.name,
          phone: courier.phone,
          vehicleType: courier.vehicle_type,
          isActive: courier.is_active,
        }));
      } catch (error) {
        throw new Error(`Error fetching couriers: ${error.message}`);
      }
    },
  },
  Mutation: {
    addCourier: async (_, { input }) => {
      try {
        const courier = await Courier.create({
          name: input.name,
          phone: input.phone,
          vehicle_type: input.vehicleType,
          is_active: input.isActive !== undefined ? input.isActive : true,
        });

        return {
          id: courier.id,
          name: courier.name,
          phone: courier.phone,
          vehicleType: courier.vehicle_type,
          isActive: courier.is_active,
        };
      } catch (error) {
        throw new Error(`Error adding courier: ${error.message}`);
      }
    },
    updateCourierStatus: async (_, { id, isActive }) => {
      try {
        const courier = await Courier.findByPk(id);
        if (!courier) {
          throw new Error(`Courier with id ${id} not found`);
        }

        courier.is_active = isActive;
        await courier.save();

        return {
          id: courier.id,
          name: courier.name,
          phone: courier.phone,
          vehicleType: courier.vehicle_type,
          isActive: courier.is_active,
        };
      } catch (error) {
        throw new Error(`Error updating courier status: ${error.message}`);
      }
    },
  },
};

module.exports = resolvers;





