'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Posts extends Model {
        static associate(models) {
            Posts.belongsTo(models.Categories, {
                foreignKey: 'category_id',
                as: 'category',
            });
        }
    }
    Posts.init({
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        photo: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Posts',
        tableName: 'posts',
        timestamps: true,
    });
    return Posts;
};