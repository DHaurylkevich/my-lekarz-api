const chatService = require("../services/chatService");

const chatController = {
    createChat: async (req, res) => {
        const { user2Id, user2Role } = req.body;

        const chat = await chatService.createChat(req.user, user2Id, user2Role);
        res.status(201).json(chat);
    },
    getChats: async (req, res) => {
        const user = req.user;

        const chats = await chatService.getChats(user);
        res.status(200).json(chats);
    },
    getChatById: async (req, res) => {
        const { chatId } = req.params;
        
        const chat = await chatService.getChatById(chatId);
        res.status(200).json(chat);
    },
    deleteChat: async (req, res) => {
        const { chatId } = req.params;

        const chat = await chatService.deleteChat(chatId);
        res.status(200).json(chat);
    }
};

module.exports = chatController;