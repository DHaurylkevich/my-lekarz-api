'use strict';
const { faker } = require('@faker-js/faker');
const crypto = require('crypto');

module.exports = {
    async up(queryInterface, Sequelize) {
        const patients = await queryInterface.sequelize.query(
            `SELECT id FROM Patients;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const doctors = await queryInterface.sequelize.query(
            `SELECT id FROM doctors;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const generateUniqueCode = () => {
            let code;
            do {
                code = crypto.randomBytes(6).toString('hex').toUpperCase();
            } while (usedCodes.has(code));
            usedCodes.add(code);
            return code;
        };

        const usedCodes = new Set();
        const prescriptions = [];

        for (let i = 0; i < 50; i++) {
            const prescriptionCount = faker.number.int({ min: 1, max: 5 });

            for (let j = 0; j < prescriptionCount; j++) {
                prescriptions.push({
                    patient_id: patients[faker.number.int({ min: 0, max: patients.length - 1 })].id,
                    doctor_id: doctors[faker.number.int({ min: 0, max: doctors.length - 1 })].id,
                    code: generateUniqueCode(),
                    expiration_date: j % 2 == 0 ? faker.date.future() : faker.date.past(),
                    status: j % 2 == 0 ? "active" : "inactive",
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }

        await queryInterface.bulkInsert('prescriptions', prescriptions, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('prescriptions', null, {});
    }
};