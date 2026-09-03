const messageService = require("../services/messageService");
const logger = require("../utils/logger");

const sendMessage = async ({ io, socket, chatId, to, content, fileUrl = null }) => {
    try {
        const savedMessage = await messageService.createMessage({
            content,
            chat_id: chatId,
            sender_id: socket.user.id,
            sender_type: socket.user.role,
            file_url: fileUrl,
            status: "sent",
            timestamp: new Date()
        });

        io.to(`chat:${chatId}`).emit("message:new", savedMessage);

        // io.to(`chat:${chatId}`).emit("message:status", {
        //     messageId: savedMessage.id,
        //     status: 'sent'
        // });

        io.to(`user_${to}`).emit(`message:${savedMessage.id}:delivered`, async () => {
            await messageService.updateMessageStatus(savedMessage.id, 'delivered');

            io.to(`chat:${chatId}`).emit("message:status", {
                messageId: savedMessage.id,
                status: 'delivered'
            });
        });

        logger.info(`SEND MESSAGE ${to} ${socket.user.id}`);
    } catch (err) {
        logger.error("Error:", err);
        socket.emit("error", { message: "Error saving message" });
    }
};

const listMessages = async ({ socket, chatId, limit, offset }) => {
    const messages = await messageService.getMessagesByChatId({ chatId, userId: socket.user.id, limit, offset });
    socket.emit("message:list", messages);
};

const readMessage = async ({ io, socket, messageId }) => {
    const message = await messageService.getMessageById(messageId);

    if (message.sender_id !== socket.user.id) {
        await messageService.updateMessageStatus(messageId, "read");
        io.to(`chat:${message.chat_id}`).emit("message:status", { messageId, status: "read" });
    }
};

module.exports = {
    sendMessage,
    listMessages,
    readMessage
};
