'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('prescription_medications', {
      prescription_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Prescriptions',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      medication_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Medications',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('prescription_medications');
  }
};