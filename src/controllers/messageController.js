const messageService = require("../services/messageService");

const messageController = {
    createMessage: async (req, res, next) => {
        const { chatId } = req.params;
        const { content } = req.body;

        try {
            const messageData = {
                chat_id: chatId,
                sender_id: req.user.id,
                sender_type: req.user.role === "clinic" ? "clinic" : "user",
                content,
                file_url: req.file ? req.file.path : null,
            };

            const message = await messageService.createMessage(messageData);
            res.status(200).json(message);
        } catch (err) {
            next(err);
        }
    },
    getMessages: async (req, res, next) => {
        const { chatId } = req.params;
        const limit = parseInt(req.query.limit) || 15;
        const offset = parseInt(req.query.offset) || 0;

        try {
            const messages = await messageService.getMessagesByChatId({ chatId, userId: req.user.id, limit, offset });
            res.status(200).json(messages);
        } catch (err) {
            next(err);
        }
    },
    deleteMessage: async (req, res, next) => {
        const { messageId } = req.params;

        try {
            const message = await messageService.deleteMessage(messageId, req.user);
            res.status(200).json(message);
        } catch (err) {
            next(err);
        }
    }
};

module.exports = messageController;
