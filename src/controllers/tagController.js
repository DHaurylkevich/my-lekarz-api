const TagService = require("../services/tagService");

const TagController = {
    createTag: async (req, res, next) => {
        const tagData = req.body;

        try {
            const tag = await TagService.createTag(tagData);
            res.status(201).json(tag);
        } catch (err) {
            next(err);
        }
    },
    getAllTags: async (req, res, next) => {
        try {
            const tags = await TagService.getAllTags()
            res.status(200).json(tags);
        } catch (err) {
            next(err);
        }
    },
    updateTag: async (req, res, next) => {
        const { tagId } = req.params;
        const tagData = req.body;

        try {
            const updateTag = await TagService.updateTag(tagId, tagData);
            res.status(200).json(updateTag);
        } catch (err) {
            next(err);
        }
    },
    deleteTag: async (req, res, next) => {
        const { tagId } = req.params;

        try {
            await TagService.deleteTag(tagId);
            res.status(200).json({ message: "Successful delete" });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = TagController;