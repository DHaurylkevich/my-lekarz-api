'use strict';
const { faker, fakerPL } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const users = [];
        const roleUser = [{ "role": "admin", "gmail": "admin@gmail.com" }, { "role": "doctor", "gmail": "doctor@gmail.com" }, { "gmail": "patient@gmail.com", "role": "patient" }]
        for (const user of roleUser) {
            users.push({
                photo: faker.image.avatar(),
                first_name: fakerPL.person.firstName(),
                last_name: fakerPL.person.lastName(),
                email: user.gmail,
                gender: faker.helpers.arrayElement(['male', 'female']),
                pesel: fakerPL.number.int({ min: 10000000000, max: 99999999999 }).toString(),
                phone: fakerPL.phone.number({ style: 'international' }),
                password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                role: user.role,
                birthday: fakerPL.date.birthdate({ min: 18, max: 70, mode: 'age' }),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        for (let i = 0; i < 200; i++) {
            users.push({
                photo: faker.image.avatar(),
                first_name: fakerPL.person.firstName(),
                last_name: fakerPL.person.lastName(),
                email: fakerPL.internet.email(),
                gender: faker.helpers.arrayElement(['male', 'female']),
                pesel: faker.number.int({ min: 10000000000, max: 99999999999 }).toString(),
                phone: fakerPL.phone.number({ style: 'international' }),
                password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                role: 'doctor',
                birthday: fakerPL.date.birthdate({ min: 18, max: 70, mode: 'age' }),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        for (let i = 0; i < 1000; i++) {
            users.push({
                photo: fakerPL.image.avatar(),
                first_name: fakerPL.person.firstName(),
                last_name: fakerPL.person.lastName(),
                email: fakerPL.internet.email(),
                gender: faker.helpers.arrayElement(['male', 'female']),
                pesel: faker.number.int({ min: 10000000000, max: 99999999999 }).toString(),
                phone: fakerPL.phone.number({ style: 'international' }),
                password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                role: 'patient',
                birthday: fakerPL.date.birthdate({ min: 18, max: 70, mode: 'age' }),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        await queryInterface.bulkInsert('users', users, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('users', null, {});
    }
};