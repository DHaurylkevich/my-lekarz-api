"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Patients extends Model {
    static associate(models) {
      Patients.belongsTo(models.Users, {
        foreignKey: "user_id",
        as: "user",
      });
      Patients.hasMany(models.Appointments, {
        foreignKey: "patient_id",
        as: "appointments",
      });
      Patients.hasMany(models.Documents, {
        foreignKey: "patient_id",
        as: "documents"
      });
      Patients.hasMany(models.Reviews, {
        foreignKey: "patient_id",
        as: "reviews"
      });
      Patients.hasMany(models.Prescriptions, {
        foreignKey: "patient_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  Patients.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    feedbackRating: {
      type: DataTypes.INTEGER,
      max: 5,
      min: 0,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: "Patients",
    tableName: "patients",
  });
  return Patients;
};