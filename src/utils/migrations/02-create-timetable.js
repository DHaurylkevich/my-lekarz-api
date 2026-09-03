'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('timetables', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            clinic_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'clinics',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            day_of_week: {
                type: Sequelize.INTEGER,
                allowNull: false,
                validate: {
                    min: 1,
                    max: 7,
                }
            },
            start_time: {
                type: Sequelize.TIME,
                allowNull: true
            },
            end_time: {
                type: Sequelize.TIME,
                allowNull: true
            }
        });

        await queryInterface.addIndex('timetables', ['clinic_id', 'day_of_week'], {
            unique: true
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('timetables');
    }
};