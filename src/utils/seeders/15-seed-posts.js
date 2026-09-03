'use strict';
const { fakerPL } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const categories = await queryInterface.sequelize.query('SELECT id FROM categories', { type: Sequelize.QueryTypes.SELECT });

        if (categories.length === 0) {
            throw new Error('No categories found');
        }

        const posts = [];

        for (let i = 0; i < 100; i++) {
            posts.push({
                photo: fakerPL.image.url(),
                title: fakerPL.lorem.sentence(1),
                content: fakerPL.lorem.text(),
                category_id: categories[Math.floor(Math.random() * categories.length)].id,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        await queryInterface.bulkInsert('posts', posts, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('posts', null, {});
    }
};