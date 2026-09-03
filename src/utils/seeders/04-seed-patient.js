'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const users = await queryInterface.sequelize.query(
            `SELECT id FROM users WHERE role = 'patient';`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const patients = users.map((user) => ({
            user_id: user.id,
            feedbackRating: faker.number.int({ min: 0, max: 5 }),
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        await queryInterface.bulkInsert('patients', patients, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('patients', null, {});
    }
};
