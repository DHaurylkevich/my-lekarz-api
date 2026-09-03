const chatService = require("../services/chatService");

const chatController = {
    createChat: async (req, res, next) => {
        const { user2Id, user2Role } = req.body;

        try {
            const chat = await chatService.createChat(req.user, { id: user2Id, role: user2Role });
            res.status(201).json(chat);
        } catch (err) {
            next(err);
        }
    },
    getChats: async (req, res, next) => {
        try {
            const chats = await chatService.getChats(req.user);
            res.status(200).json(chats);
        } catch (err) {
            next(err);
        }
    },
    getChatById: async (req, res, next) => {
        const { chatId } = req.params;

        try {
            const chat = await chatService.getChatById(chatId, req.user);
            res.status(200).json(chat);
        } catch (err) {
            next(err);
        }
    },
    deleteChat: async (req, res, next) => {
        const { chatId } = req.params;

        try {
            const chat = await chatService.deleteChat(chatId, req.user);
            res.status(200).json(chat);
        } catch (err) {
            next(err);
        }
    }
};

module.exports = chatController;
