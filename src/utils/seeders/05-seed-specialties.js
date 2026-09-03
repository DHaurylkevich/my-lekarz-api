'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const specialties = [
            { name: "Alergolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Anestezjolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Angiolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Audiolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Chirurg", createdAt: new Date(), updatedAt: new Date() },
            { name: "Chirurg dziecięcy", createdAt: new Date(), updatedAt: new Date() },
            { name: "Chirurg naczyniowy", createdAt: new Date(), updatedAt: new Date() },
            { name: "Chirurg onkolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Chirurg plastyczny", createdAt: new Date(), updatedAt: new Date() },
            { name: "Chirurg szczękowy", createdAt: new Date(), updatedAt: new Date() },
            { name: "Chirurg transplantolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Chirurg urazowy", createdAt: new Date(), updatedAt: new Date() },
            { name: "Choroby zakaźne", createdAt: new Date(), updatedAt: new Date() },
            { name: "Dermatolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Diabetolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Endokrynolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Epidemiolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Fizjoterapeuta", createdAt: new Date(), updatedAt: new Date() },
            { name: "Gastroenterolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Genetyk", createdAt: new Date(), updatedAt: new Date() },
            { name: "Geriatra", createdAt: new Date(), updatedAt: new Date() },
            { name: "Ginekolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Hematolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Hepatolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Internista", createdAt: new Date(), updatedAt: new Date() },
            { name: "Kardiolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Laryngolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Logopeda", createdAt: new Date(), updatedAt: new Date() },
            { name: "Medycyna estetyczna", createdAt: new Date(), updatedAt: new Date() },
            { name: "Medycyna nuklearna", createdAt: new Date(), updatedAt: new Date() },
            { name: "Medycyna paliatywna", createdAt: new Date(), updatedAt: new Date() },
            { name: "Medycyna rodzinna", createdAt: new Date(), updatedAt: new Date() },
            { name: "Medycyna sądowa", createdAt: new Date(), updatedAt: new Date() },
            { name: "Nefrolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Neonatolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Neurolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Neurochirurg", createdAt: new Date(), updatedAt: new Date() },
            { name: "Okulista", createdAt: new Date(), updatedAt: new Date() },
            { name: "Onkolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Ortopeda", createdAt: new Date(), updatedAt: new Date() },
            { name: "Patomorfolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Pediatra", createdAt: new Date(), updatedAt: new Date() },
            { name: "Periodontolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Pielęgniarka", createdAt: new Date(), updatedAt: new Date() },
            { name: "Położna", createdAt: new Date(), updatedAt: new Date() },
            { name: "Psychiatra", createdAt: new Date(), updatedAt: new Date() },
            { name: "Psycholog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Pulmonolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Radiolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Reumatolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Stomatolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Toksykolog", createdAt: new Date(), updatedAt: new Date() },
            { name: "Urolog", createdAt: new Date(), updatedAt: new Date() },
        ];

        await queryInterface.bulkInsert('specialties', specialties, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('specialties', null, {});
    }
};
