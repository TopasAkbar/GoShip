const CoveredArea = require('./models/CoveredArea');
const { Op } = require('sequelize');

const resolvers = {
  Query: {
    getCoveredAreas: async (_, { isActive }) => {
      try {
        const where = {};
        if (isActive !== undefined && isActive !== null) {
          where.is_active = isActive;
        }

        const areas = await CoveredArea.findAll({ where });
        return areas.map(area => ({
          id: area.id,
          province: area.province,
          city: area.city,
          district: area.district,
          isActive: area.is_active,
        }));
      } catch (error) {
        throw new Error(`Error fetching covered areas: ${error.message}`);
      }
    },
  },
  Mutation: {
    addCoveredArea: async (_, { input }) => {
      try {
        const area = await CoveredArea.create({
          province: input.province,
          city: input.city,
          district: input.district,
          is_active: input.isActive !== undefined ? input.isActive : true,
        });

        return {
          id: area.id,
          province: area.province,
          city: area.city,
          district: area.district,
          isActive: area.is_active,
        };
      } catch (error) {
        throw new Error(`Error adding covered area: ${error.message}`);
      }
    },
  },
};

module.exports = resolvers;





