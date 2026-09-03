'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('addresses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      clinic_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'clinics',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      city: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      street: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      province: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      home: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      post_index: {
        type: Sequelize.STRING(6),
        allowNull: false
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('addresses');
  }
};