const NotionService = require("../services/notionService");

const NotionController = {
    createNotion: async (req, res, next) => {
        const notionData = req.body;

        try {
            const notion = await NotionService.createNotion(notionData);
            res.status(201).json(notion);
        } catch (err) {
            next(err);
        }
    },
    getAllNotions: async (req, res, next) => {
        try {
            const notions = await NotionService.getAllNotions()
            res.status(200).json(notions);
        } catch (err) {
            next(err);
        }
    },
    updateNotion: async (req, res, next) => {
        const { notionId } = req.params;
        const notionData = req.body;

        try {
            const updateNotion = await NotionService.updateNotion(notionId, notionData);
            res.status(200).json(updateNotion);
        } catch (err) {
            next(err);
        }
    },
    deleteNotion: async (req, res, next) => {
        const { notionId } = req.params;

        try {
            await NotionService.deleteNotion(notionId);
            res.status(200).json({ message: "Notion deleted successfully" });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = NotionController;