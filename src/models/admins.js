'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Admins extends Model {
        static associate(models) {
            Admins.belongsTo(models.Users, {
                foreignKey: 'user_id',
                as: 'user',
            });
            Admins.hasMany(models.Notions, {
                foreignKey: 'admin_id',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                as: "notions"
            });
        }
    }
    Admins.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        }
    }, {
        sequelize,
        modelName: 'Admins',
        tableName: 'admins',
    });
    return Admins;
};