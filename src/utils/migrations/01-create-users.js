'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      photo: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      first_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      last_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      gender: {
        type: Sequelize.ENUM('male', 'female'),
        allowNull: true
      },
      pesel: {
        type: Sequelize.STRING(11),
        allowNull: true,
        unique: true,
        validate: {
          len: [11]
        }
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: true,
        validate: {
          len: [8, 128]
        }
      },
      role: {
        type: Sequelize.ENUM('patient', 'doctor', 'admin'),
        allowNull: false,
        defaultValue: 'patient'
      },
      birthday: {
        type: Sequelize.DATE,
        allowNull: true
      },
      resetToken: {
        type: Sequelize.STRING(255),
        allowNull: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  }
};
