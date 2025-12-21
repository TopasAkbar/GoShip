const { analyticsDb } = require('../config/database');
const {
  DeliveryPerformance,
  CourierMetrics,
  AreaStatistics,
} = require('../models');

const seedData = async () => {
  try {
    await analyticsDb.authenticate();
    console.log('Analytics database connection established.');

    await analyticsDb.sync({ force: true });
    console.log('Analytics database tables synced.');

    // Seed Delivery Performance
    const deliveryPerformance = [
      {
        area: 'JAKARTA',
        average_days: 2.5,
        total_shipments: 150,
      },
      {
        area: 'BANDUNG',
        average_days: 3.0,
        total_shipments: 120,
      },
      {
        area: 'SURABAYA',
        average_days: 4.0,
        total_shipments: 100,
      },
    ];

    await DeliveryPerformance.bulkCreate(deliveryPerformance);
    console.log('Delivery Performance data seeded.');

    // Seed Courier Metrics
    const courierMetrics = [
      {
        courier_id: 1,
        courier_name: 'Budi Santoso',
        total_deliveries: 50,
        success_rate: 95.5,
        average_delivery_time: 2.3,
      },
      {
        courier_id: 2,
        courier_name: 'Siti Nurhaliza',
        total_deliveries: 45,
        success_rate: 97.8,
        average_delivery_time: 2.1,
      },
      {
        courier_id: 3,
        courier_name: 'Ahmad Fauzi',
        total_deliveries: 60,
        success_rate: 94.2,
        average_delivery_time: 2.8,
      },
    ];

    await CourierMetrics.bulkCreate(courierMetrics);
    console.log('Courier Metrics data seeded.');

    // Seed Area Statistics
    const areaStatistics = [
      {
        area: 'JAKARTA',
        total_shipments: 150,
        failed_shipments: 5,
        failure_rate: 3.33,
      },
      {
        area: 'BANDUNG',
        total_shipments: 120,
        failed_shipments: 4,
        failure_rate: 3.33,
      },
      {
        area: 'SURABAYA',
        total_shipments: 100,
        failed_shipments: 6,
        failure_rate: 6.0,
      },
    ];

    await AreaStatistics.bulkCreate(areaStatistics);
    console.log('Area Statistics data seeded.');

    console.log('All seed data inserted successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();





