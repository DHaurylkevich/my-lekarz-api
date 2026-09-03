// seed-timetables.js
'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const clinics = await queryInterface.sequelize.query(
            `SELECT id FROM clinics;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const timetables = [];
        const days = [1, 2, 3, 4, 5, 6, 7];

        clinics.forEach(clinic => {
            days.forEach(day => {
                if (day !== 6 && day !== 7) {
                    timetables.push({
                        clinic_id: clinic.id,
                        day_of_week: day,
                        start_time: '08:00',
                        end_time: '18:00'
                    });
                } else {
                    timetables.push({
                        clinic_id: clinic.id,
                        day_of_week: day
                    });
                }
            });
        });

        await queryInterface.bulkInsert('timetables', timetables, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('timetables', null, {});
    }
};