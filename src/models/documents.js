"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Documents extends Model {
        static associate(models) {
            Documents.belongsTo(models.Patients, {
                foreignKey: "patient_id",
                as: "patient",
            });
            Documents.belongsTo(models.Doctors, {
                foreignKey: "doctor_id",
                as: "doctor",
            });
        }
    }
    Documents.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        link: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: "Documents",
        tableName: "documents",
    });
    return Documents;
};