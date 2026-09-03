'use strict';
const { fakerPL } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const admins = await queryInterface.sequelize.query(
            `SELECT id FROM admins`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (admins.length === 0) {
            throw new Error('No admin users found');
        }

        const notions = [];

        for (let i = 0; i < 50; i++) {
            notions.push({
                admin_id: admins[Math.floor(Math.random() * admins.length)].id,
                content: fakerPL.lorem.sentences({ min: 1, max: 3 }),
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        await queryInterface.bulkInsert('notions', notions, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('notions', null, {});
    }
};
