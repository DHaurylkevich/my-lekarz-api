'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('prescriptions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            patient_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'patients',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            doctor_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'doctors',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            medication_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'medications',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            code: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            expiration_date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('prescriptions');
    }
};
