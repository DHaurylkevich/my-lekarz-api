'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Specialties extends Model {
        static associate(models) {
            Specialties.hasMany(models.Doctors, {
                foreignKey: 'specialty_id',
                as: 'doctors',
            });
            Specialties.hasMany(models.Services, {
                foreignKey: 'specialty_id',
                as: 'services',
            });
        }
    }
    Specialties.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Specialties',
        tableName: 'specialties',
    });
    return Specialties;
};