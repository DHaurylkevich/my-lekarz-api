'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('tags', {
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
            },
            positive: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('tags');
    }
};