const { Op } = require("sequelize");
const db = require("../models");
const AppError = require("../utils/appError");

const chatService = {
    createChat: async (user, to) => {
        const normalizeType = (role) => (role === "clinic" ? "clinic" : "user");

        let user2;
        if (to.role === "clinic") {
            user2 = await db.Clinics.findByPk(to.id);
        } else {
            user2 = await db.Users.findByPk(to.id);
        }

        if (!user2) {
            throw new AppError("User not found", 404);
        }

        const participants = [
            { id: user.id, type: normalizeType(user.role) },
            { id: user2.id, type: normalizeType(to.role) }
        ];

        const chat = await chatService.getOneChatByUsers(participants);
        if (chat) {
            return chat.id;
        }

        try {
            const newChat = await db.Chats.create();
            await db.ChatParticipants.bulkCreate(
                participants.map(({ id, type }) => ({
                    chat_id: newChat.id,
                    user_id: id,
                    user_type: type,
                }))
            );
            return newChat.id;
        } catch (err) {
            throw new AppError("Error creating chat: " + err.message, 500);
        }
    },
    getChats: async (user) => {
        if (!user) {
            throw new AppError("User is undefined", 400);
        }
        user.role = user.role !== "clinic" ? "user" : user.role;

        try {
            const chatIds = await db.ChatParticipants.findAll({
                attributes: ["chat_id"],
                where: {
                    user_id: user.id,
                    user_type: user.role
                }
            });
            const chatIdsArray = chatIds.map(chat => chat.chat_id);

            const chats = await db.Chats.findAll({
                attributes: ["id"],
                where: {
                    id: {
                        [Op.in]: chatIdsArray
                    }
                },
                include: [
                    {
                        model: db.ChatParticipants,
                        as: 'chatParticipants',
                        attributes: ['user_id', 'user_type'],
                        where: {
                            [Op.not]: {
                                user_id: user.id,
                                user_type: user.role
                            }
                        },
                        include: [
                            {
                                model: db.Users,
                                as: 'user',
                                attributes: ["id", "first_name", "last_name", "photo"],
                                required: false,
                                where: {
                                    '$chatParticipants.user_type$': 'user'
                                }
                            },
                            {
                                model: db.Clinics,
                                as: 'clinic',
                                attributes: ["id", "name", "photo"],
                                required: false,
                                where: {
                                    '$chatParticipants.user_type$': 'clinic'
                                }
                            }
                        ]
                    },
                    {
                        model: db.Messages,
                        as: 'messages',
                        limit: 1,
                        order: [['createdAt', 'DESC']]
                    }
                ],
            });

            return chats;
        } catch (err) {
            throw new AppError("Error loading chats: " + err.message, 500);
        }
    },
    getChatById: async (chatId, user) => {
        const userType = user.role !== "clinic" ? "user" : "clinic";

        try {
            const chat = await db.Chats.findOne({
                attributes: ["id", "createdAt"],
                where: {
                    id: chatId,
                    '$chatParticipants.user_id$': user.id,
                    '$chatParticipants.user_type$': userType,
                },
                include: [
                    {
                        model: db.ChatParticipants,
                        as: 'chatParticipants',
                        attributes: ['user_id', 'user_type'],
                        include: [
                            {
                                model: db.Users,
                                as: 'user',
                                attributes: ["id", "first_name", "last_name", "photo"],
                                required: false,
                                where: {
                                    '$chatParticipants.user_type$': 'user'
                                }
                            },
                            {
                                model: db.Clinics,
                                as: 'clinic',
                                attributes: ["id", "name", "photo"],
                                required: false,
                                where: {
                                    '$chatParticipants.user_type$': 'clinic'
                                }
                            }
                        ]
                    },
                    {
                        model: db.Messages,
                        as: 'messages',
                        order: [['createdAt', 'ASC']]
                    }
                ],
            });

            if (!chat) {
                throw new AppError("Chat not found", 404);
            }

            return chat;
        } catch (err) {
            if (err instanceof AppError) {
                throw err;
            }
            throw new AppError("Error loading chat: " + err.message, 500);
        }
    },
    getOneChatByUsers: async (participants) => {
        if (participants.length !== 2) {
            throw new AppError('A direct chat must have exactly two participants.');
        }

        try {
            const chat = await db.Chats.findOne({
                include: [
                    {
                        model: db.ChatParticipants,
                        as: 'chatParticipants',
                        where: {
                            [Op.and]: participants.map(({ id, type }) => ({
                                user_id: id,
                                user_type: type,
                            })),
                        },
                    },
                ],
            });
            return chat;
        } catch (err) {
            throw new AppError("Error loading chat: " + err.message, 500);
        }
    },
    deleteChat: async (chatId, user) => {
        const userType = user.role !== "clinic" ? "user" : "clinic";

        const participant = await db.ChatParticipants.findOne({
            where: { chat_id: chatId, user_id: user.id, user_type: userType }
        });
        if (!participant) {
            throw new AppError("Chat not found", 404);
        }

        return await db.Chats.destroy({ where: { id: chatId } });
    }
};

module.exports = chatService;
