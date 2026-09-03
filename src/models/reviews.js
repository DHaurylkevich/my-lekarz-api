'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Reviews extends Model {
        static associate(models) {
            Reviews.belongsTo(models.Patients, {
                foreignKey: 'patient_id',
                as: 'patient',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            });
            Reviews.belongsTo(models.Doctors, {
                foreignKey: 'doctor_id',
                as: 'doctor',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            });
            Reviews.belongsToMany(models.Tags, {
                through: 'ReviewTags',
                foreignKey: 'review_id',
                otherKey: 'tag_id',
                as: 'tags',
            });
        }
    }
    Reviews.init({
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
            },
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        moderationComment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending',
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Reviews',
        tableName: 'reviews',
        timestamps: true,
    });
    return Reviews;
};
