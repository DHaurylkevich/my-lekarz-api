'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const users = await queryInterface.sequelize.query(
            `SELECT id FROM users WHERE role = 'admin'`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const admins = users.map((user) => ({
            user_id: user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        await queryInterface.bulkInsert('admins', admins, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('admins', null, {});
    }
};
