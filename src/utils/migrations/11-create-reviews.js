'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('reviews', {
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
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            doctor_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'doctors',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            rating: {
                type: Sequelize.INTEGER,
                allowNull: false,
                validate: {
                    min: 1,
                    max: 5
                }
            },
            comment: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            moderationComment: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('pending', 'approved', 'rejected'),
                defaultValue: 'pending',
                allowNull: false
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('reviews');
    }
};