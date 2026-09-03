'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('notions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            admin_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'admins',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('notions');
    }
};