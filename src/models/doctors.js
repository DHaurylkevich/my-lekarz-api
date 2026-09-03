'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Doctors extends Model {
    static associate(models) {
      Doctors.belongsTo(models.Users, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        as: "user"
      });
      Doctors.belongsTo(models.Clinics, {
        foreignKey: 'clinic_id',
        as: 'clinic'
      });
      Doctors.belongsTo(models.Specialties, {
        foreignKey: 'specialty_id',
        as: 'specialty',
      });
      Doctors.belongsToMany(models.Services, {
        through: models.DoctorService,
        foreignKey: 'doctor_id',
        otherKey: 'service_id',
        as: 'services',
      });
      Doctors.hasMany(models.Schedules, {
        foreignKey: "doctor_id",
        onDelete: 'CASCADE',
      });
      Doctors.hasMany(models.Documents, {
        foreignKey: "doctor_id",
        as: "documents"
      });
      Doctors.hasMany(models.Reviews, {
        foreignKey: "doctor_id",
        as: "reviews"
      });
      Doctors.hasMany(models.Prescriptions, {
        foreignKey: 'doctor_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }
  Doctors.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    clinic_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    specialty_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    hired_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Doctors',
    tableName: 'doctors',
  });
  return Doctors;
};