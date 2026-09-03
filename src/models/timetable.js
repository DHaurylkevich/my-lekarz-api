'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Timetables extends Model {
        static associate(models) {
            Timetables.belongsTo(models.Clinics, {
                foreignKey: "clinic_id",
                as: "clinic"
            });
        }
    }
    Timetables.init({
        day_of_week: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 7,
            },
        },
        start_time: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        end_time: {
            type: DataTypes.TIME,
            allowNull: true,
        }
    }, {
        sequelize,
        modelName: 'Timetables',
        tableName: 'timetables',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['clinic_id', 'day_of_week']
            }
        ]
    });
    return Timetables;
};