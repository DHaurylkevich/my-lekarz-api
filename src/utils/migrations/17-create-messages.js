'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('messages', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            chat_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'chats',
                    key: 'id'
                }
            },
            sender_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            sender_type: {
                type: Sequelize.ENUM('user', 'clinic'),
                allowNull: false
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('sent', 'delivered', 'read'),
                defaultValue: 'sent'
            },
            file_url: {
                type: Sequelize.STRING(255),
                allowNull: true
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('messages');
    }
};