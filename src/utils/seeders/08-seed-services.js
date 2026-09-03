'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const clinics = await queryInterface.sequelize.query(
            `SELECT id FROM clinics;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const specialties = await queryInterface.sequelize.query(
            `SELECT id FROM specialties;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const services = [];
        const serviceNames = [
            "ULTRASOUND",
            "X-ray",
            "Blood test",
            "ECG",
            "Vaccination",
            "Physiotherapy",
            "MRI",
            "CT SCAN",
            "Massage",
            "Dental Checkup",
            "Eye Examination",
            "Cardiology Consultation",
            "Dermatology Consultation",
            "Orthopedic Consultation",
            "ENT Consultation",
            "Gastroenterology Consultation",
            "Neurology Consultation",
            "Psychiatry Consultation",
            "Pediatric Consultation",
            "General Surgery",
            "Gynecology Consultation",
            "Urology Consultation",
            "Nephrology Consultation",
            "Oncology Consultation",
            "Endocrinology Consultation",
            "Pulmonology Consultation",
            "Rheumatology Consultation",
            "Allergy Testing",
            "Hearing Test",
            "Physical Therapy",
            "Occupational Therapy",
            "Speech Therapy",
            "Nutritional Counseling",
            "Chiropractic Care",
            "Acupuncture",
            "Homeopathy",
            "Aromatherapy",
            "Reflexology",
            "Laser Therapy",
            "Cosmetic Surgery",
            "Hair Transplant",
            "Skin Care Treatment",
            "Weight Loss Program",
            "Smoking Cessation Program",
            "Diabetes Management",
            "Hypertension Management",
            "Cholesterol Management",
            "Asthma Management",
            "COPD Management",
            "Sleep Study",
            "Stress Management",
            "Pain Management",
            "Rehabilitation Services",
            "Prenatal Care",
            "Postnatal Care",
            "Family Planning",
            "Sexual Health Services",
            "HIV Testing and Counseling",
            "STD Testing and Treatment",
            "Travel Medicine",
            "Occupational Health Services",
            "Sports Medicine",
            "Telemedicine Consultation"
        ];

        clinics.forEach(clinic => {
            specialties.forEach(specialty => {

                const numServices = faker.number.int({ min: 3, max: 7 });
                const selectedServices = faker.helpers.arrayElements(serviceNames, numServices);

                selectedServices.forEach(serviceName => {
                    services.push({
                        name: serviceName,
                        price: faker.number.float({ min: 50, max: 500, precision: 0.01 }),
                        clinic_id: clinic.id,
                        specialty_id: specialty.id,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                });
            });
        });

        await queryInterface.bulkInsert('services', services, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('services', null, {});
    }
};