const chatController = require("../controllers/chatController");
const { isAuthenticated } = require('../middleware/auth');

const router = require("express").Router();
/**
 * @swagger
 * paths:
 *   /chats:
 *     post:
 *       summary: Crete a new chat
 *       description: Creates a new chat between two users
 *       tags:
 *         - Chats
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user2Id:
 *                   type: integer
 *                 user2Role:
 *                   type: string
 *                   enum:
 *                     - doctor
 *                     - admin
 *                     - clinic
 */
router.post("/chats", isAuthenticated, chatController.createChat);
/**
 * @swagger
 * paths:
 *   /users/chats:
 *     get:
 *       summary: get all chats
 *       tags:
 *         - Chats
 *       responses:
 *         200:
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   schema:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       user_1_id:
 *                         type: integer
 *                       user_1_type:
 *                         type: string
 *                       user_2_id:
 *                         type: integer
 *                       user_2_type:
 *                         type: string
 *                       user1:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           first_name:
 *                             type: string
 *                           last_name:
 *                             type: string
 *                           photo:
 *                             type: string
 *                       clinic1:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           photo:
 *                             type: string
 *                       user2:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           first_name:
 *                             type: string
 *                           last_name:
 *                             type: string
 *                           photo:
 *                             type: string
 *                       clinic2:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           photo:
 *                             type: string
 *                       messages:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             content:
 *                               type: string
 *                             created_at:
 *                               type: string
 *                               format: date-time
 *                       created_at:
 *                         type: string
 *                         format: date-time
 */
router.get("/users/chats", isAuthenticated, chatController.getChats);
/**
 * @swagger
 * paths:
 *   /chats/{chatId}:
 *     get:
 *       summary: get chat by ID
 *       tags:
 *         - Chats
 *       parameters:
 *         - name: chatId
 *           in: path
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Successful
 */
router.get("/chats/:chatId", isAuthenticated, chatController.getChatById);
/**
 * @swagger
 * paths:
 *   /chats/{chatId}:
 *     delete:
 *       summary: delete chat by ID
 *       tags:
 *         - Chats
 *       parameters:
 *         - name: chatId
 *           in: path
 *           required: true
 *       responses:
 *         200:
 *           description: Successful
 */
router.delete("/chats/:chatId", isAuthenticated, chatController.deleteChat);

module.exports = router;