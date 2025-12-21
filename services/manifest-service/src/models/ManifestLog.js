const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ManifestLog = sequelize.define('ManifestLog', {
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
    unique: true,
  },
  barcode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'Manifest_Logs',
  timestamps: false,
});

module.exports = ManifestLog;





