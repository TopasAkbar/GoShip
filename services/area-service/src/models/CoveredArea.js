const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CoveredArea = sequelize.define('CoveredArea', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  province: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  district: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'Covered_Areas',
  timestamps: false,
});

module.exports = CoveredArea;





