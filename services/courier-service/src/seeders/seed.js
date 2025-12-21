const sequelize = require('../config/database');
const Courier = require('../models/Courier');

const seedData = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync({ force: true });
    console.log('Database tables synced.');

    const couriers = [
      {
        name: 'Budi Santoso',
        phone: '081234567890',
        vehicle_type: 'MOTORCYCLE',
        is_active: true,
      },
      {
        name: 'Siti Nurhaliza',
        phone: '081234567891',
        vehicle_type: 'MOTORCYCLE',
        is_active: true,
      },
      {
        name: 'Ahmad Fauzi',
        phone: '081234567892',
        vehicle_type: 'VAN',
        is_active: true,
      },
      {
        name: 'Dewi Sartika',
        phone: '081234567893',
        vehicle_type: 'TRUCK',
        is_active: false,
      },
      {
        name: 'Rudi Hartono',
        phone: '081234567894',
        vehicle_type: 'MOTORCYCLE',
        is_active: true,
      },
    ];

    await Courier.bulkCreate(couriers);
    console.log('Seed data inserted successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();





