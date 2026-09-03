'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('categories', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING(255),
                allowNull: false,
                unique: false    
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('categories');
    }
};