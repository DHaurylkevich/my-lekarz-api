'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      Users.hasOne(models.Patients, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        as: "patient"
      });
      Users.hasOne(models.Doctors, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        as: "doctor"
      });
      Users.hasOne(models.Admins, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        as: "admins"
      });
      Users.hasOne(models.Addresses, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        as: "address"
      });
      Users.hasMany(models.ChatParticipants, {
        foreignKey: 'user_id',
        constraints: false,
        as: 'chatParticipants',
      });
    }
  }
  Users.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    photo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    first_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      }
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: true
    },
    pesel: {
      type: DataTypes.STRING(11),
      allowNull: true,
      unique: true,
      validate: {
        len: [11],
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: [8, 128],
      }
    },
    role: {
      type: DataTypes.ENUM('patient', 'doctor', 'admin'),
      allowNull: false,
      defaultValue: "patient"
    },
    birthday: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resetToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Users',
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        unique: true,
        fields: ['pesel']
      },
      {
        unique: true,
        fields: ['phone']
      },
    ]
  });
  return Users;
};