'use strict';

// The chat feature was removed from the codebase. These tables may still exist
// in databases created by the old migrations (16, 17, 21), so drop them here.
// Order matters: chat_participants and messages reference chats.
module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.query('DROP TABLE IF EXISTS "chat_participants";');
        await queryInterface.sequelize.query('DROP TABLE IF EXISTS "messages";');
        await queryInterface.sequelize.query('DROP TABLE IF EXISTS "chats";');
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.createTable('chats', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: new Date()
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: new Date()
            }
        });
    }
};
