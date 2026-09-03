'use strict';
const { fakerPL } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const doctors = await queryInterface.sequelize.query(
            `SELECT id, clinic_id FROM doctors;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const startDate = new Date('2025-02-01');
        const endDate = new Date('2025-12-31');
        const schedules = [];

        doctors.forEach(doctor => {
            const numSchedules = fakerPL.number.int({ min: 5, max: 7 });

            for (let i = 0; i < numSchedules; i++) {
                const isMorning = fakerPL.datatype.boolean();
                const startHour = isMorning ? fakerPL.number.int({ min: 8, max: 10 }) : fakerPL.number.int({ min: 12, max: 14 });
                const endHour = isMorning ? fakerPL.number.int({ min: 14, max: 16 }) : fakerPL.number.int({ min: 18, max: 20 });

                schedules.push({
                    doctor_id: doctor.id,
                    clinic_id: doctor.clinic_id,
                    interval: fakerPL.helpers.arrayElement([10, 15, 20, 30]),
                    date: fakerPL.date.between({ from: startDate, to: endDate }).toISOString().split('T')[0],
                    start_time: `${startHour}:00`,
                    end_time: `${endHour}:00`,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        });

        await queryInterface.bulkInsert('schedules', schedules, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('schedules', null, {});
    }
};