const sequelize = require('../config/database');
const ManifestLog = require('../models/ManifestLog');
const crypto = require('crypto');

function generateBarcode(orderId, destination) {
  const data = `${orderId}-${destination}-${Date.now()}`;
  return crypto.createHash('md5').update(data).digest('hex').substring(0, 16).toUpperCase();
}

function generateTrackingNumber(orderId) {
  const prefix = 'GS';
  const timestamp = Date.now().toString().slice(-8);
  const orderHash = crypto.createHash('md5').update(orderId).digest('hex').substring(0, 6).toUpperCase();
  return `${prefix}${timestamp}${orderHash}`;
}

const seedData = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync({ force: true });
    console.log('Database tables synced.');

    const manifests = [
      {
        order_id: 'ORD001',
        tracking_number: generateTrackingNumber('ORD001'),
        barcode: generateBarcode('ORD001', 'BANDUNG'),
        created_at: new Date(),
      },
      {
        order_id: 'ORD002',
        tracking_number: generateTrackingNumber('ORD002'),
        barcode: generateBarcode('ORD002', 'SURABAYA'),
        created_at: new Date(),
      },
      {
        order_id: 'ORD003',
        tracking_number: generateTrackingNumber('ORD003'),
        barcode: generateBarcode('ORD003', 'JAKARTA'),
        created_at: new Date(),
      },
    ];

    await ManifestLog.bulkCreate(manifests);
    console.log('Seed data inserted successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();





