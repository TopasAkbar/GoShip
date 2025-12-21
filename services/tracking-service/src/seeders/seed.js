const sequelize = require('../config/database');
const ShipmentStatus = require('../models/ShipmentStatus');

const seedData = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync({ force: true });
    console.log('Database tables synced.');

    const shipments = [
      {
        tracking_number: 'GS001234567',
        status: 'IN_TRANSIT',
        location: 'Jakarta Sorting Center',
        updated_at: new Date(),
      },
      {
        tracking_number: 'GS001234568',
        status: 'DELIVERED',
        location: 'Bandung Delivery Hub',
        updated_at: new Date(),
      },
      {
        tracking_number: 'GS001234569',
        status: 'PENDING',
        location: 'Surabaya Warehouse',
        updated_at: new Date(),
      },
      {
        tracking_number: 'GS001234570',
        status: 'IN_TRANSIT',
        location: 'Yogyakarta Transit',
        updated_at: new Date(),
      },
      {
        tracking_number: 'GS001234571',
        status: 'OUT_FOR_DELIVERY',
        location: 'Jakarta Delivery Route',
        updated_at: new Date(),
      },
    ];

    await ShipmentStatus.bulkCreate(shipments);
    console.log('Seed data inserted successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();





