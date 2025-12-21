const { Sequelize } = require('sequelize');
require('dotenv').config();

// Main analytics database
const analyticsDb = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

// Tracking database connection
const trackingDb = new Sequelize(
  process.env.TRACKING_DB_NAME || 'tracking_db',
  process.env.TRACKING_DB_USER || 'postgres',
  process.env.TRACKING_DB_PASSWORD || 'postgres',
  {
    host: process.env.TRACKING_DB_HOST || 'tracking-db',
    port: process.env.TRACKING_DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

// Courier database connection
const courierDb = new Sequelize(
  process.env.COURIER_DB_NAME || 'courier_db',
  process.env.COURIER_DB_USER || 'postgres',
  process.env.COURIER_DB_PASSWORD || 'postgres',
  {
    host: process.env.COURIER_DB_HOST || 'courier-db',
    port: process.env.COURIER_DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

// Manifest database connection
const manifestDb = new Sequelize(
  process.env.MANIFEST_DB_NAME || 'manifest_db',
  process.env.MANIFEST_DB_USER || 'postgres',
  process.env.MANIFEST_DB_PASSWORD || 'postgres',
  {
    host: process.env.MANIFEST_DB_HOST || 'manifest-db',
    port: process.env.MANIFEST_DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = {
  analyticsDb,
  trackingDb,
  courierDb,
  manifestDb,
};

