'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const doctors = await queryInterface.sequelize.query(
            `SELECT id, clinic_id, specialty_id FROM doctors;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const createdServices = await queryInterface.sequelize.query(
            `SELECT id, clinic_id, specialty_id FROM services;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const doctorServices = [];

        for (const doctor of doctors) {
            const clinicServices = createdServices.filter(
                service => service.clinic_id === doctor.clinic_id && service.specialty_id === doctor.specialty_id
            );

            if (clinicServices.length > 0) {
                const numServices = faker.number.int({ min: 2, max: clinicServices.length });
                const selectedServices = faker.helpers.arrayElements(clinicServices, numServices);

                selectedServices.forEach(service => {
                    doctorServices.push({
                        doctor_id: doctor.id,
                        service_id: service.id,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                });
            } else {
                console.warn(`No services found for doctor ${doctor.id} in clinic ${doctor.clinic_id}`);
            }
        }

        if (doctorServices.length > 0) {
            await queryInterface.bulkInsert('doctor_services', doctorServices, {});
        } else {
            console.warn('No doctor services to insert');
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('doctor_services', null, {});
    }
};