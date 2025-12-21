const { DataTypes } = require('sequelize');
const { analyticsDb, trackingDb, courierDb, manifestDb } = require('../config/database');

// Analytics database models
const DeliveryPerformance = analyticsDb.define('DeliveryPerformance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  area: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  average_days: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  total_shipments: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'Delivery_Performance',
  timestamps: false,
});

const CourierMetrics = analyticsDb.define('CourierMetrics', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  courier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  courier_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  total_deliveries: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  success_rate: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  average_delivery_time: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'Courier_Metrics',
  timestamps: false,
});

const AreaStatistics = analyticsDb.define('AreaStatistics', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  area: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  total_shipments: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  failed_shipments: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  failure_rate: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'Area_Statistics',
  timestamps: false,
});

// External database models (read-only access)
const ShipmentStatus = trackingDb.define('ShipmentStatus', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tracking_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  updated_at: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'Shipment_Status',
  timestamps: false,
});

const Courier = courierDb.define('Courier', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  vehicle_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
  },
}, {
  tableName: 'Couriers',
  timestamps: false,
});

const ManifestLog = manifestDb.define('ManifestLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  order_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tracking_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  barcode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'Manifest_Logs',
  timestamps: false,
});

module.exports = {
  DeliveryPerformance,
  CourierMetrics,
  AreaStatistics,
  ShipmentStatus,
  Courier,
  ManifestLog,
};





