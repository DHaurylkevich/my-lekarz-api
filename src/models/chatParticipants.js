'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ChatParticipants extends Model {
        static associate(models) {
            ChatParticipants.belongsTo(models.Chats, {
                foreignKey: "chat_id"
            });
            ChatParticipants.belongsTo(models.Users, {
                foreignKey: 'user_id',
                constraints: false,
                as: 'user',
            });
            ChatParticipants.belongsTo(models.Clinics, {
                foreignKey: 'user_id',
                constraints: false,
                as: 'clinic',
            });
        }
    }
    ChatParticipants.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        chat_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'chats',
                key: 'id'
            },
            allowNull: false,
        },
        user_type: {
            type: DataTypes.ENUM('user', 'clinic'),
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'ChatParticipants',
        tableName: 'chat_participants',
    });
    return ChatParticipants;
};
