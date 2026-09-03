'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ReviewTags extends Model {
        static associate(models) {
            ReviewTags.belongsTo(models.Reviews, {
                foreignKey: 'review_id',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                as: 'review',
            });
            ReviewTags.belongsTo(models.Tags, {
                foreignKey: 'tag_id',
                onUpdate: 'CASCADE',
                as: 'tag',
            });
        }
    }
    ReviewTags.init({
        review_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        tag_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
    }, {
        sequelize,
        timestamps: false,
        modelName: 'ReviewTags',
        tableName: 'review_tags',
    });
    return ReviewTags;
};