'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const patients = await queryInterface.sequelize.query(
            `SELECT id FROM patients;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const schedules = await queryInterface.sequelize.query(
            `SELECT schedules.id, schedules.start_time, schedules.end_time, schedules.interval, 
                    schedules.clinic_id, schedules.doctor_id, doctor_services.id AS doctor_service_id
            FROM schedules
            INNER JOIN doctor_services ON schedules.doctor_id = doctor_services.doctor_id;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const timeToMinutes = (time) => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const minutesToTime = (minutes) => {
            const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
            const mins = (minutes % 60).toString().padStart(2, '0');
            return `${hours}:${mins}`;
        };

        const getAvailableSlots = (schedule) => {
            const { start_time, end_time, interval } = schedule;
            const start = timeToMinutes(start_time);
            const end = timeToMinutes(end_time);
            const slots = [];

            for (let time = start; time + interval <= end; time += interval) {
                slots.push(minutesToTime(time));
            }
            return slots;
        };

        const scheduleSlots = {};
        schedules.forEach(schedule => {
            scheduleSlots[schedule.id] = getAvailableSlots(schedule);
        });

        const totalAvailableSlots = Object.values(scheduleSlots).reduce((sum, slots) => sum + slots.length, 0);
        if (totalAvailableSlots < 100) {
            console.warn(`❌ Недостаточно доступных мест в расписаниях! Нужно минимум 100, но есть только ${totalAvailableSlots}.`);
            return;
        }

        const appointments = [];
        while (appointments.length < 100) {
            const patient = faker.helpers.arrayElement(patients);
            const validSchedules = schedules.filter(s => scheduleSlots[s.id]?.length);
            if (!validSchedules.length) break;

            const schedule = faker.helpers.arrayElement(validSchedules);
            const timeSlot = scheduleSlots[schedule.id].shift();

            appointments.push({
                patient_id: patient.id,
                schedule_id: schedule.id,
                clinic_id: schedule.clinic_id,
                doctor_service_id: schedule.doctor_service_id,
                time_slot: timeSlot,
                description: faker.lorem.sentence(),
                first_visit: faker.datatype.boolean(),
                visit_type: faker.helpers.arrayElement(['prywatna', 'NFZ']),
                status: faker.helpers.arrayElement(['active', 'completed']),
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        if (appointments.length < 100) {
            console.warn(`❌ Не удалось создать 100 записей! Всего создано: ${appointments.length}`);
            return;
        }

        await queryInterface.bulkInsert('appointments', appointments, {});
        console.log(`✅ Успешно создано ${appointments.length} записей.`);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('appointments', null, {});
    }
};