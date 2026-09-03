'use strict';

const realAddresses = [
    { city: 'Warszawa', street: 'Marszałkowska', province: 'Mazowieckie', post_index: '00-001' },
    { city: 'Warszawa', street: 'Aleje Jerozolimskie', province: 'Mazowieckie', post_index: '00-511' },
    { city: 'Kraków', street: 'Floriańska', province: 'Małopolskie', post_index: '30-001' },
    { city: 'Kraków', street: 'Grodzka', province: 'Małopolskie', post_index: '31-006' },
    { city: 'Wrocław', street: 'Świdnicka', province: 'Dolnośląskie', post_index: '50-001' },
    { city: 'Wrocław', street: 'Legnicka', province: 'Dolnośląskie', post_index: '54-203' },
    { city: 'Gdańsk', street: 'Długa', province: 'Pomorskie', post_index: '80-001' },
    { city: 'Gdańsk', street: 'Grunwaldzka', province: 'Pomorskie', post_index: '80-241' },
    { city: 'Łódź', street: 'Piotrkowska', province: 'Łódzkie', post_index: '90-001' },
    { city: 'Łódź', street: 'Narutowicza', province: 'Łódzkie', post_index: '90-135' },
    { city: 'Poznań', street: 'Święty Marcin', province: 'Wielkopolskie', post_index: '61-001' },
    { city: 'Poznań', street: 'Garbary', province: 'Wielkopolskie', post_index: '61-868' },
    { city: 'Szczecin', street: 'Wojska Polskiego', province: 'Zachodniopomorskie', post_index: '70-470' },
    { city: 'Szczecin', street: 'Jagiellońska', province: 'Zachodniopomorskie', post_index: '70-364' },
    { city: 'Bydgoszcz', street: 'Dworcowa', province: 'Kujawsko-Pomorskie', post_index: '85-010' },
    { city: 'Bydgoszcz', street: 'Gdańska', province: 'Kujawsko-Pomorskie', post_index: '85-005' },
    { city: 'Lublin', street: 'Krakowskie Przedmieście', province: 'Lubelskie', post_index: '20-002' },
    { city: 'Lublin', street: 'Narutowicza', province: 'Lubelskie', post_index: '20-016' },
    { city: 'Katowice', street: 'Mariacka', province: 'Śląskie', post_index: '40-014' },
    { city: 'Katowice', street: 'Chorzowska', province: 'Śląskie', post_index: '40-101' },
    { city: 'Białystok', street: 'Lipowa', province: 'Podlaskie', post_index: '15-424' },
    { city: 'Białystok', street: 'Sienkiewicza', province: 'Podlaskie', post_index: '15-092' },
    { city: 'Rzeszów', street: '3 Maja', province: 'Podkarpackie', post_index: '35-030' },
    { city: 'Rzeszów', street: 'Piłsudskiego', province: 'Podkarpackie', post_index: '35-074' },
    { city: 'Gdynia', street: 'Świętojańska', province: 'Pomorskie', post_index: '81-368' },
    { city: 'Gdynia', street: '10 Lutego', province: 'Pomorskie', post_index: '81-366' },
    { city: 'Toruń', street: 'Szeroka', province: 'Kujawsko-Pomorskie', post_index: '87-100' },
    { city: 'Toruń', street: 'Chełmińska', province: 'Kujawsko-Pomorskie', post_index: '87-100' },
    { city: 'Opole', street: 'Ozimska', province: 'Opolskie', post_index: '45-057' },
    { city: 'Opole', street: 'Krakowska', province: 'Opolskie', post_index: '45-018' },
    { city: 'Sosnowiec', street: 'Modrzejowska', province: 'Śląskie', post_index: '41-200' },
    { city: 'Sosnowiec', street: 'Warszawska', province: 'Śląskie', post_index: '41-219' },
    { city: 'Kielce', street: 'Sienkiewicza', province: 'Świętokrzyskie', post_index: '25-002' },
    { city: 'Kielce', street: 'Żelazna', province: 'Świętokrzyskie', post_index: '25-001' },
    { city: 'Olsztyn', street: 'Staromiejska', province: 'Warmińsko-Mazurskie', post_index: '10-002' },
    { city: 'Olsztyn', street: 'Piłsudskiego', province: 'Warmińsko-Mazurskie', post_index: '10-575' },
    { city: 'Rybnik', street: 'Sobieskiego', province: 'Śląskie', post_index: '44-200' },
    { city: 'Rybnik', street: 'Kościuszki', province: 'Śląskie', post_index: '44-200' },
    { city: 'Zielona Góra', street: 'Bohaterów Westerplatte', province: 'Lubuskie', post_index: '65-001' },
    { city: 'Zielona Góra', street: 'Stefana Batorego', province: 'Lubuskie', post_index: '65-002' },
    { city: 'Dąbrowa Górnicza', street: 'Królowej Jadwigi', province: 'Śląskie', post_index: '41-300' },
    { city: 'Dąbrowa Górnicza', street: '3 Maja', province: 'Śląskie', post_index: '41-300' },
    { city: 'Płock', street: 'Tumska', province: 'Mazowieckie', post_index: '09-400' },
    { city: 'Płock', street: 'Grodzka', province: 'Mazowieckie', post_index: '09-402' },
    { city: 'Elbląg', street: 'Stary Rynek', province: 'Warmińsko-Mazurskie', post_index: '82-300' },
    { city: 'Elbląg', street: 'Nowowiejska', province: 'Warmińsko-Mazurskie', post_index: '82-300' }
];

function getRandomAddress() {
    const addr = realAddresses[Math.floor(Math.random() * realAddresses.length)];
    return {
        city: addr.city,
        street: addr.street,
        province: addr.province,
        home: Math.floor(Math.random() * 100) + 1,
        flat: Math.floor(Math.random() * 50) + 1,
        post_index: addr.post_index
    };
}

module.exports = {
    async up(queryInterface, Sequelize) {
        const clinics = await queryInterface.sequelize.query(
            `SELECT id FROM clinics;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        let addresses = clinics.map((clinic) => {
            const addr = getRandomAddress();
            return {
                clinic_id: clinic.id,
                city: addr.city,
                street: addr.street,
                province: addr.province,
                home: addr.home,
                flat: addr.flat,
                post_index: addr.post_index,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        });

        await queryInterface.bulkInsert('addresses', addresses, {});

        const users = await queryInterface.sequelize.query(
            `SELECT id FROM users;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        addresses = users.map((user) => {
            const addr = getRandomAddress();
            return {
                user_id: user.id,
                city: addr.city,
                street: addr.street,
                province: addr.province,
                home: addr.home,
                flat: addr.flat,
                post_index: addr.post_index,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        });

        await queryInterface.bulkInsert('addresses', addresses, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('addresses', null, {});
    }
};