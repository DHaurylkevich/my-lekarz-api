const db = require("../models");
const AppError = require("../utils/appError");

const NotionService = {
    createNotion: async (notionData) => {
        const notion = await db.Notions.create(notionData);
        return { id: notion.id, content: notion.content }
    },
    getAllNotions: async () => {
        const notions = await db.Notions.findAll({ order: [["createdAt", "DESC"]], attributes: ["id", "content"] });
        return notions;
    },
    updateNotion: async (notionId, notionData) => {
        let notion = await db.Notions.findByPk(notionId);
        if (!notion) {
            throw new AppError("Notion not found", 404);
        }

        notion = await notion.update(notionData);

        return { content: notion.content };
    },
    deleteNotion: async (notionId) => {
        const notion = await db.Notions.findByPk(notionId);
        if (!notion) {
            throw new AppError("Notion not found", 404);
        }

        await notion.destroy();
    }
};

module.exports = NotionService;