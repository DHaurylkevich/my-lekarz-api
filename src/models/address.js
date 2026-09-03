'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    static associate(models) {
      Address.belongsTo(models.Users, {
        foreignKey: "user_id",
        as: 'user'
      });
      Address.belongsTo(models.Clinics, {
        foreignKey: "clinic_id",
        as: 'clinic'
      })
    }
  }
  Address.init({
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    province: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    street: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    home: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    flat: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    post_index: {
      type: DataTypes.STRING(10),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Addresses',
    tableName: 'addresses'
  });
  return Address;
};