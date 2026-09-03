'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Messages extends Model {
        static associate(models) {
            Messages.belongsTo(models.Chats, {
                foreignKey: 'chat_id',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            });
        }
    }
    Messages.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        sender_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        sender_type: {
            type: DataTypes.ENUM('user', 'clinic'),
            allowNull: false
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('sent', 'delivered', 'read'),
            defaultValue: 'sent'
        },
        file_url: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Messages',
        tableName: 'messages',
        timestamps: true,
    });
    return Messages;
};
