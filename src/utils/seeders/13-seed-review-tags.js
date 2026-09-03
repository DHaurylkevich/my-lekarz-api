'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const reviews = await queryInterface.sequelize.query(
            `SELECT id FROM reviews;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const tags = await queryInterface.sequelize.query(
            `SELECT id FROM tags;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const reviewTags = [];
        reviews.forEach(review => {
            const numTags = faker.number.int({ min: 1, max: 3 });
            const selectedTags = faker.helpers.arrayElements(tags, numTags);

            selectedTags.forEach(tag => {
                reviewTags.push({
                    review_id: review.id,
                    tag_id: tag.id
                });
            });
        });

        await queryInterface.bulkInsert('review_tags', reviewTags, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('review_tags', null, {});
    }
};
