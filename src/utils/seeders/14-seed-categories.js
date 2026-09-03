'use strict';
const { fakerPL } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const categories = [
            { name: "Porady zdrowotne", createdAt: new Date(), updatedAt: new Date() },
            { name: "Nowoczesne metody leczenia", createdAt: new Date(), updatedAt: new Date() },
            { name: "Profilaktyka chorób", createdAt: new Date(), updatedAt: new Date() },
            { name: "Zdrowy styl życia", createdAt: new Date(), updatedAt: new Date() },
            { name: "Choroby przewlekłe", createdAt: new Date(), updatedAt: new Date() },
            { name: "Pediatria i zdrowie dzieci", createdAt: new Date(), updatedAt: new Date() },
            { name: "Psychologia i zdrowie psychiczne", createdAt: new Date(), updatedAt: new Date() },
            { name: "Rehabilitacja i fizjoterapia", createdAt: new Date(), updatedAt: new Date() },
            { name: "Porady dietetyczne", createdAt: new Date(), updatedAt: new Date() },
            { name: "Zdrowie kobiet", createdAt: new Date(), updatedAt: new Date() },
            { name: "Zdrowie mężczyzn", createdAt: new Date(), updatedAt: new Date() },
            { name: "Medycyna estetyczna", createdAt: new Date(), updatedAt: new Date() },
            { name: "Opieka nad seniorami", createdAt: new Date(), updatedAt: new Date() },
            { name: "Pierwsza pomoc", createdAt: new Date(), updatedAt: new Date() },
            { name: "Szczepienia i odporność", createdAt: new Date(), updatedAt: new Date() },
            { name: "Chirurgia i zabiegi medyczne", createdAt: new Date(), updatedAt: new Date() },
            { name: "Zdrowie skóry i dermatologia", createdAt: new Date(), updatedAt: new Date() },
            { name: "Kardiologia i zdrowie serca", createdAt: new Date(), updatedAt: new Date() },
            { name: "Nowotwory i onkologia", createdAt: new Date(), updatedAt: new Date() },
            { name: "Medycyna alternatywna", createdAt: new Date(), updatedAt: new Date() },
        ];

        await queryInterface.bulkInsert('categories', categories, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('categories', null, {});
    }
};
