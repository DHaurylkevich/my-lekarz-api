'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DoctorService extends Model {
    static associate(models) {
      DoctorService.belongsTo(models.Doctors, {
        foreignKey: 'doctor_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        as: 'doctor'
      });
      DoctorService.belongsTo(models.Services, {
        foreignKey: 'service_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        as: 'service'
      });
      DoctorService.hasMany(models.Appointments, {
        foreignKey: 'doctor_service_id',
        as: 'appointments'
      });
    }
  }

  DoctorService.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'DoctorService',
    tableName: 'doctor_services',
    timestamps: true,
  });

  return DoctorService;
};