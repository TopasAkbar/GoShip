const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PricingRule = sequelize.define('PricingRule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  origin: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  min_weight: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  max_weight: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'Pricing_Rules',
  timestamps: false,
});

module.exports = PricingRule;





