'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("clinics", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      nip: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      nr_license: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      phone: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.STRING(6),
        allowNull: false,
        defaultValue: "clinic"
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      feedbackRating: {
        type: Sequelize.INTEGER,
        max: 5,
        min: 0,
        allowNull: true
      },
      photo: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("clinics");
  }
};