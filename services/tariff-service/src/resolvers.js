const PricingRule = require('./models/PricingRule');

const resolvers = {
  Query: {
    getShippingCost: async (_, { origin, destination, weight }) => {
      try {
        const pricingRule = await PricingRule.findOne({
          where: {
            origin: origin.toUpperCase(),
            destination: destination.toUpperCase(),
            min_weight: {
              [require('sequelize').Op.lte]: weight,
            },
            max_weight: {
              [require('sequelize').Op.gte]: weight,
            },
          },
        });

        if (!pricingRule) {
          throw new Error(`No pricing rule found for origin: ${origin}, destination: ${destination}, weight: ${weight}kg`);
        }

        return {
          origin: pricingRule.origin,
          destination: pricingRule.destination,
          weight: weight,
          price: pricingRule.price,
          currency: 'IDR',
        };
      } catch (error) {
        throw new Error(`Error calculating shipping cost: ${error.message}`);
      }
    },
  },
};

module.exports = resolvers;





