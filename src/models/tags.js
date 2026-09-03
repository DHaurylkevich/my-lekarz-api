'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Tags extends Model {
        static associate(models) {
            Tags.belongsToMany(models.Reviews, {
                through: 'ReviewTags',
                foreignKey: 'tag_id',
                otherKey: 'review_id',
                as: 'reviews',
            });
        }
    }
    Tags.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false,
        },
        positive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        }
    }, {
        sequelize,
        modelName: 'Tags',
        tableName: 'tags',
        timestamps: false,
    });
    return Tags;
};
