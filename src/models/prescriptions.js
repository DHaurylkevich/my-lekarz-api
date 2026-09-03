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
            afterFind: async (instances) => {
                if (!instances) return;

                const list = Array.isArray(instances) ? instances : [instances];
                const now = new Date();
                const expired = list.filter(p => p.expiration_date !== null && p.expiration_date < now);

                if (expired.length === 0) return;

                const ids = expired.map(p => p.id);
                await Prescriptions.update(
                    { status: 'inactive', code: null, expiration_date: null },
                    { where: { id: ids } }
                );

                expired.forEach(p => {
                    p.status = 'inactive';
                    p.code = null;
                    p.expiration_date = null;
                });
            }
        }
    });
    return Prescriptions;
};
