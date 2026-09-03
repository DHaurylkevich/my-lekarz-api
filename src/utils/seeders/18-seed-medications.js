'use strict';

const { fakerPL } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const medications = [
            { name: "Paracetamol 500 mg", createdAt: new Date(), updatedAt: new Date() },
            { name: "Ibuprofen 400 mg", createdAt: new Date(), updatedAt: new Date() },
            { name: "Amoksycylina 875 mg", createdAt: new Date(), updatedAt: new Date() },
            { name: "Metformina 850 mg", createdAt: new Date(), updatedAt: new Date() },
            { name: "Atorwastatyna 20 mg", createdAt: new Date(), updatedAt: new Date() },
            { name: "Losartan 50 mg", createdAt: new Date(), updatedAt: new Date() },
            { name: "Omeprazol 40 mg", createdAt: new Date(), updatedAt: new Date() },
            { name: "Salbutamol 100 µg", createdAt: new Date(), updatedAt: new Date() },
            { name: "Ciprofloxacyna 500 mg", createdAt: new Date(), updatedAt: new Date() },
            { name: "Drotaweryna 80 mg", createdAt: new Date(), updatedAt: new Date() },
            { name: "Loratadyna 10 mg", createdAt: new Date(), updatedAt: new Date() },
            { name: "Ketoprofen 100 mg", createdAt: new Date(), updatedAt: new Date() },
            { name: "Prednizon 5 mg", createdAt: new Date(), updatedAt: new Date() },
            { name: "Hydroksyzyna 25 mg", createdAt: new Date(), updatedAt: new Date() },
            { name: "Tramadol 50 mg", createdAt: new Date(), updatedAt: new Date() },
            { name: "Fluoksetyna 20 mg", createdAt: new Date(), updatedAt: new Date() },
            { name: "Witamina D3 2000 IU", createdAt: new Date(), updatedAt: new Date() },
            { name: "Kwas foliowy 5 mg", createdAt: new Date(), updatedAt: new Date() },
            { name: "Magnez + B6 100 mg", createdAt: new Date(), updatedAt: new Date() },
            { name: "Acetylocysteina 600 mg", createdAt: new Date(), updatedAt: new Date() },
        ];

        await queryInterface.bulkInsert('medications', medications, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('medications', null, {});
    }
};

