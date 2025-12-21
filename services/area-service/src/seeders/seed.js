const sequelize = require('../config/database');
const CoveredArea = require('../models/CoveredArea');

const seedData = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync({ force: true });
    console.log('Database tables synced.');

    const areas = [
      {
        province: 'DKI Jakarta',
        city: 'Jakarta Pusat',
        district: 'Gambir',
        is_active: true,
      },
      {
        province: 'DKI Jakarta',
        city: 'Jakarta Selatan',
        district: 'Kebayoran Baru',
        is_active: true,
      },
      {
        province: 'Jawa Barat',
        city: 'Bandung',
        district: 'Cimahi',
        is_active: true,
      },
      {
        province: 'Jawa Timur',
        city: 'Surabaya',
        district: 'Gubeng',
        is_active: true,
      },
      {
        province: 'DI Yogyakarta',
        city: 'Yogyakarta',
        district: 'Mergangsan',
        is_active: true,
      },
      {
        province: 'Jawa Tengah',
        city: 'Semarang',
        district: 'Semarang Tengah',
        is_active: false,
      },
    ];

    await CoveredArea.bulkCreate(areas);
    console.log('Seed data inserted successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();





