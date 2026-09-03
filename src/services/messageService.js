const db = require("../models");
const AppError = require("../utils/appError");

const messageService = {
    createMessage: async (messageData) => {
        const participant = await db.ChatParticipants.findOne({
            where: {
                chat_id: messageData.chat_id,
                user_id: messageData.sender_id,
                user_type: messageData.sender_type,
            }
        });
        if (!participant) {
            throw new AppError("Chat not found", 404);
        }

        return await db.Messages.create(messageData);
    },
    getMessagesByChatId: async ({ chatId, userId, limit = 10, offset = 0 }) => {
        const chat = await db.Chats.findByPk(chatId, {
            attributes: ['id'],
            include: [
                {
                    model: db.ChatParticipants,
                    as: 'chatParticipants',
                    attributes: [],
                    where: { user_id: userId },
                    required: true,
                },
                {
                    model: db.Messages,
                    as: 'messages',
                    limit,
                    offset
                }
            ]
        });

        if (!chat) {
            throw new AppError("Chat not found", 404);
        }

        return chat;
    },
    getMessageById: async (messageId) => {
        return await db.Messages.findByPk(messageId);
    },
    updateMessageStatus: async (messageId, status) => {
        return await db.Messages.update({ status }, { where: { id: messageId } });
    },
    deleteMessage: async (messageId, user) => {
        const message = await db.Messages.findOne({
            where: {
                id: messageId,
                sender_id: user.id,
                sender_type: user.role === "clinic" ? "clinic" : "user",
            }
        });

        if (!message) {
            throw new AppError("Message not found", 404);
        }

        return await message.destroy();
    }
};

module.exports = messageService;
