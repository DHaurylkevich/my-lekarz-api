'use strict';
const { Model } = require('sequelize');
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
    class Prescriptions extends Model {
        static associate(models) {
            Prescriptions.belongsTo(models.Patients, {
                foreignKey: 'patient_id',
                as: 'patient',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            });
            Prescriptions.belongsTo(models.Doctors, {
                foreignKey: 'doctor_id',
                as: 'doctor',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            });
            Prescriptions.belongsToMany(models.Medications, {
                through: 'PrescriptionMedications',
                foreignKey: 'prescription_id',
                otherKey: 'medication_id',
                as: 'medications',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            });
        }
    }
    Prescriptions.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            defaultValue: () => crypto.randomBytes(6).toString('hex'),
        },
        expiration_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'active',
        },
    }, {
        sequelize,
        modelName: 'Prescriptions',
        tableName: 'prescriptions',
        timestamps: true,
        hooks: {
            afterFind: async (prescriptions) => {
                if (!prescriptions) return;
                const now = new Date();
                const expiredPrescriptions = prescriptions.filter(p => p.expiration_date < now && p.expiration_date !== null);

                if (expiredPrescriptions.length > 0) {
                    await Prescriptions.update(
                        { status: 'inactive', code: null, expiration_date: null },
                        { where: { id: expiredPrescriptions.map(p => p.id) } }
                    );
                }
            }
        }
    });
    return Prescriptions;
};
