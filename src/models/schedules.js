'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Schedules extends Model {
    static associate(models) {
      Schedules.belongsTo(models.Doctors, {
        foreignKey: "doctor_id",
        as: "doctor"
      });
      Schedules.belongsTo(models.Clinics, {
        foreignKey: "clinic_id",
        as: "clinic"
      });
      Schedules.hasMany(models.Appointments, {
        foreignKey: "schedule_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        as: "appointments"
      });
    }
  }
  Schedules.init({
    interval: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    available_slots: {
      type: DataTypes.VIRTUAL,
      readOnly: true,
      get() {
        const appointments = this.getDataValue('appointments') || [];
        const startTime = this.getDataValue('start_time');
        const endTime = this.getDataValue('end_time');
        const interval = this.getDataValue('interval');

        const slots = [];
        let currentTime = new Date(`1970-01-01T${startTime}Z`);
        const endTimeDate = new Date(`1970-01-01T${endTime}Z`);

        while (currentTime < endTimeDate) {
          slots.push(currentTime.toISOString().split('T')[1].slice(0, 5));
          currentTime = new Date(currentTime.getTime() + interval * 60000);
        }

        const occupiedSlots = appointments.map(a => a.time_slot.slice(0, -3));
        return slots.filter(slot => !occupiedSlots.includes(slot));
      },
    },
  }, {
    sequelize,
    modelName: 'Schedules',
    tableName: 'schedules',
  });
  return Schedules;
};