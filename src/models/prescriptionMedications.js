// filepath: /Users/mac/Documents/ProjectS/doc-web/src/models/prescriptionMedications.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class PrescriptionMedications extends Model {
        static associate(models) {
            PrescriptionMedications.belongsTo(models.Prescriptions, {
                foreignKey: 'prescription_id',
                as: 'prescription',
            });
            PrescriptionMedications.belongsTo(models.Medications, {
                foreignKey: 'medication_id',
                as: 'medication',
            });
        }
    }
    PrescriptionMedications.init({
        prescription_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Prescriptions',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        medication_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Medications',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
    }, {
        sequelize,
        modelName: 'PrescriptionMedications',
        tableName: 'prescription_medications',
        timestamps: false,
    });
    return PrescriptionMedications;
};