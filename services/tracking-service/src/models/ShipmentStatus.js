const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShipmentStatus = sequelize.define('ShipmentStatus', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tracking_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
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
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'Shipment_Status',
  timestamps: false,
});

module.exports = ShipmentStatus;





