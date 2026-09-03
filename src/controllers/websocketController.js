const { Server } = require("socket.io");
// const AppError = require("../utils/appError");
const logger = require("../utils/logger");
// const sessionStore = require("../config/store");
const { startChatWithMessage, listChats } = require("../socketHandlers/chat");
const { sendMessage, listMessages, readMessage } = require("../socketHandlers/message");
const { userList } = require("../socketHandlers/user");

function onlyForHandshake(middleware) {
    return (req, res, next) => {
        const isHandshake = req._query.sid === undefined;
        if (isHandshake) {
            middleware(req, res, next);
        } else {
            next();
        }
    };
}

module.exports = (server, sessionConfig, passport) => {
    const io = new Server(server, {
        connectionStateRecovery: {},
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        maxHttpBufferSize: 1e8,
        cors: {
            origin: "*",
            credentials: true
        }
    });

    io.engine.use(onlyForHandshake(sessionConfig));
    io.engine.use(onlyForHandshake(passport.session()));
    io.engine.use((req, res, next) => {
        if (req.user) {
            next();
        } else {
            res.writeHead(401);
            res.end();
        }
    });

    io.use(async (socket, next) => {
        socket.sessionID = socket.request.session.id;
        socket.user = socket.request.session.passport?.user;
        logger.info("Данные passport:", socket.user);
        logger.info(`Session ID: ${socket.sessionID}`);
        logger.info(`User Id ${socket.user.id}`);
        logger.info(`Connection: ${socket.user.id} ${socket.id}`);

        next();
    });

    io.on("connect", async (socket) => {

        await socket.join(`session:${socket.sessionID}`);//Конкретная разные сессии одно юзера
        await socket.join(`user:${socket.user.id}`);//Для разных устройст одна комната у юзера


        socket.emit("user:list", await userList({ io, socket }));
        socket.broadcast.emit("user:connect", { userId: socket.user.id, username: socket.username, connected: true, });


        socket.on("chat:start:firstMessage", async ({ to, content }) => startChatWithMessage({ io, socket, to, content }));
        socket.emit("chat:list", await listChats({ io, socket }));
        // socket.on("chat:search", searchChats({ io, socket }));


        socket.on("message:send", async ({ chatId, to, content }) => sendMessage({ io, socket, chatId, to, content }));
        socket.on("message:read", async (messageId) => readMessage({ io, socket, messageId }));
        socket.on("message:list", async ({ chatId, limit, offset }) => listMessages({ io, socket, chatId, limit, offset }));
        // socket.on("message:typing", ({ chatId, userId }) => {    
        //     socket.to(chatId).emit("user:typing", userId);
        // });


        socket.on('reconnect', (userId) => {
            console.log(`Пользователь ${userId} переподключился`);
        });

        // if (!socket.recovered) {
        // }

        socket.on("disconnect", async () => {
            try {
                const matchingSockets = await io.in(`user:${socket.user.id}`).fetchSockets();

                const isDisconnected = matchingSockets.length === 0;
                if (isDisconnected) {
                    socket.broadcast.emit("user:disconnect", socket.user.id);
                    logger.info(`User ${socket.user.id} disconnected`)
                }
            } catch (error) {
                logger.error(error);
            }
        });
    });

    return io;
};                          