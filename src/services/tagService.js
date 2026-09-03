const db = require("../models");
const AppError = require("../utils/appError");

const tagService = {
    createTag: async (tagData) => {
        return await db.Tags.create(tagData);
    },
    getAllTags: async () => {
        return await db.Tags.findAll();
    },
    updateTag: async (tagId, tagData) => {
        const tag = await db.Tags.findByPk(tagId);
        if (!tag) {
            throw new AppError("Tag not found", 404);
        }

        await tag.update(tagData);
    },
    deleteTag: async (tagId) => {
        const tag = await db.Tags.findByPk(tagId);
        if (!tag) {
            throw new AppError("Tag not found", 404);
        }

        await tag.destroy();
    }
}

module.exports = tagService;