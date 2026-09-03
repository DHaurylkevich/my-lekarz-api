'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('posts', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            photo: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            title: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            category_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'categories',
                    key: 'id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('posts');
    }
};