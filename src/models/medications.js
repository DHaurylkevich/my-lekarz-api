'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Medications extends Model {
        static associate(models) {
            Medications.belongsToMany(models.Prescriptions, {
                through: 'PrescriptionMedications',
                foreignKey: 'medication_id',
                otherKey: 'prescription_id',
                as: 'prescriptions',
            });
        }
    }
    Medications.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        }
    }, {
        sequelize,
        modelName: 'Medications',
        tableName: 'medications',
        timestamps: true,
    });
    return Medications;
};
