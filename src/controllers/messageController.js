const messageService = require("../services/messageService");

const messageController = {
    createMessage: async (req, res) => {
        const { chatId } = req.params;
        const messageData = req.body;
        messageData.file_url = req.file ? req.file.path : null;
        messageData.chat_id = chatId;

        const message = await messageService.createMessage(messageData);
        res.status(200).json(message);
    },
    getMessages: async (req, res) => {
        const { chatId } = req.params;
        const { limit = 15, offset = 0 } = req.query;

        const messages = await messageService.getMessagesByChatId(chatId, limit, offset);
        res.status(200).json(messages);
    },
    deleteMessage: async (req, res) => {
        const { messageId } = req.params;

        const message = await messageService.deleteMessage(messageId);
        res.status(200).json(message);
    }
};

module.exports = messageController;