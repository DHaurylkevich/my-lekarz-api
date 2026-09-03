'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const prescriptions = await queryInterface.sequelize.query(
            `SELECT id FROM prescriptions;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const medications = await queryInterface.sequelize.query(
            `SELECT id FROM medications;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const prescriptionMedications = [];
        prescriptions.forEach(prescription => {
            const medicationCount = faker.number.int({ min: 1, max: medications.length });
            const medicationSet = new Set();

            while (medicationSet.size < medicationCount) {
                const medication = medications[faker.number.int({ min: 0, max: medications.length - 1 })];
                medicationSet.add(medication);
            }

            medicationSet.forEach(medication => {
                prescriptionMedications.push({
                    prescription_id: prescription.id,
                    medication_id: medication.id
                });
            });
        });

        await queryInterface.bulkInsert('prescription_medications', prescriptionMedications, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('prescription_medications', null, {});
    }
};