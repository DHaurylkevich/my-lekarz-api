'use strict';
const { faker, fakerPL } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const clinics = [];

        clinics.push({
            photo: faker.image.url(),
            name: fakerPL.company.name(),
            nip: faker.number.int({ min: 1000000000, max: 9999999999 }).toString(),
            nr_license: faker.vehicle.vin(),
            email: "clinic@gmail.com",
            password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
            phone: fakerPL.phone.number({ style: 'international' }),
            description: fakerPL.lorem.sentence(),
            feedbackRating: faker.number.int({ min: 0, max: 5 }),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        for (let i = 0; i < 20; i++) {
            clinics.push({
                photo: faker.image.url(),
                name: fakerPL.company.name(),
                nip: faker.number.int({ min: 1000000000, max: 9999999999 }).toString(),
                nr_license: faker.vehicle.vin(),
                email: fakerPL.internet.email(),
                password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                phone: fakerPL.phone.number({ style: 'international' }),
                description: fakerPL.lorem.sentence(),
                feedbackRating: faker.number.int({ min: 0, max: 5 }),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        await queryInterface.bulkInsert('clinics', clinics, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('clinics', null, {});
    }
};