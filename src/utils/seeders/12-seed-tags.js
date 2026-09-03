'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const tags = [
            { name: 'Szybka obsługa', positive: true },
            { name: 'Powolna obsługa', positive: false },
            { name: 'Przyjazny personel', positive: true },
            { name: 'Nieprzyjazny personel', positive: false },
            { name: 'Czyste otoczenie', positive: true },
            { name: 'Brudne otoczenie', positive: false },
            { name: 'Wysoka jakość opieki', positive: true },
            { name: 'Niska jakość opieki', positive: false },
            { name: 'Przystępne ceny', positive: true },
            { name: 'Wysokie ceny', positive: false },
            { name: 'Szybka reakcja na potrzeby pacjenta', positive: true },
            { name: 'Powolna reakcja na potrzeby pacjenta', positive: false },
            { name: 'Pomocny personel', positive: true },
            { name: 'Niepomocny personel', positive: false },
            { name: 'Profesjonalna obsługa', positive: true },
            { name: 'Nieprofesjonalna obsługa', positive: false },
            { name: 'Dobra organizacja', positive: true },
            { name: 'Zła organizacja', positive: false },
            { name: 'Dobre doświadczenie', positive: true },
            { name: 'Złe doświadczenie', positive: false },
            { name: 'Gorąco polecam', positive: true },
            { name: 'Nie polecam', positive: false },
            { name: 'Doskonale świadczone usługi medyczne', positive: true },
            { name: 'Słaba jakość usług medycznych', positive: false },
            { name: 'Terminowe wizyty', positive: true },
            { name: 'Opóźnione wizyty', positive: false },
            { name: 'Uprzejmy personel', positive: true },
            { name: 'Niegrzeczny personel', positive: false },
            { name: 'Dobra atmosfera w placówce', positive: true },
            { name: 'Zła atmosfera w placówce', positive: false },
            { name: 'Wygodne warunki dla pacjentów', positive: true },
            { name: 'Niewygodne warunki dla pacjentów', positive: false },
            { name: 'Dogodna lokalizacja', positive: true },
            { name: 'Niedogodna lokalizacja', positive: false },
            { name: 'Skuteczna obsługa', positive: true },
            { name: 'Nieskuteczna obsługa', positive: false },
            { name: 'Kompetentny personel', positive: true },
            { name: 'Niekompetentny personel', positive: false },
            { name: 'Reagujący na potrzeby pacjenta', positive: true },
            { name: 'Ignorujący potrzeby pacjenta', positive: false },
            { name: 'Niezawodna placówka', positive: true },
            { name: 'Zawodna placówka', positive: false },
            { name: 'Godny zaufania personel', positive: true },
            { name: 'Niegodny zaufania personel', positive: false }
        ];

        await queryInterface.bulkInsert('tags', tags, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('tags', null, {});
    }
};
