const sequelize = require('../config/database');
const PricingRule = require('../models/PricingRule');

const seedData = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync({ force: true });
    console.log('Database tables synced.');

    const pricingRules = [
      {
        origin: 'JAKARTA',
        destination: 'BANDUNG',
        min_weight: 0,
        max_weight: 1,
        price: 15000,
      },
      {
        origin: 'JAKARTA',
        destination: 'BANDUNG',
        min_weight: 1,
        max_weight: 5,
        price: 25000,
      },
      {
        origin: 'JAKARTA',
        destination: 'BANDUNG',
        min_weight: 5,
        max_weight: 10,
        price: 40000,
      },
      {
        origin: 'JAKARTA',
        destination: 'SURABAYA',
        min_weight: 0,
        max_weight: 1,
        price: 25000,
      },
      {
        origin: 'JAKARTA',
        destination: 'SURABAYA',
        min_weight: 1,
        max_weight: 5,
        price: 45000,
      },
      {
        origin: 'JAKARTA',
        destination: 'SURABAYA',
        min_weight: 5,
        max_weight: 10,
        price: 70000,
      },
      {
        origin: 'BANDUNG',
        destination: 'JAKARTA',
        min_weight: 0,
        max_weight: 1,
        price: 15000,
      },
      {
        origin: 'BANDUNG',
        destination: 'JAKARTA',
        min_weight: 1,
        max_weight: 5,
        price: 25000,
      },
      {
        origin: 'SURABAYA',
        destination: 'JAKARTA',
        min_weight: 0,
        max_weight: 1,
        price: 25000,
      },
      {
        origin: 'SURABAYA',
        destination: 'JAKARTA',
        min_weight: 1,
        max_weight: 5,
        price: 45000,
      },
    ];

    await PricingRule.bulkCreate(pricingRules);
    console.log('Seed data inserted successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();





