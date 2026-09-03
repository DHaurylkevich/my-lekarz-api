'use strict';
const { faker, fakerPL } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const users = await queryInterface.sequelize.query(
            `SELECT id FROM users WHERE role = 'doctor';`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const clinics = await queryInterface.sequelize.query(
            `SELECT id FROM clinics;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const specialties = await queryInterface.sequelize.query(
            `SELECT id FROM specialties;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const doctors = users.map((user) => ({
            user_id: user.id,
            clinic_id: clinics[faker.number.int({ min: 0, max: clinics.length - 1 })].id,
            specialty_id: specialties[faker.number.int({ min: 0, max: specialties.length - 1 })].id,
            rating: faker.number.int({ min: 3, max: 5 }),
            hired_at: faker.date.past(),
            description: fakerPL.lorem.sentence(),
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        await queryInterface.bulkInsert('doctors', doctors, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('doctors', null, {});
    }
};
