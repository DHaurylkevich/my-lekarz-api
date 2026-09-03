'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('chat_participants', {
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
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            user_type: {
                type: Sequelize.ENUM('user', 'clinic'),
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
        await queryInterface.dropTable('chat_participants');
    }
};
