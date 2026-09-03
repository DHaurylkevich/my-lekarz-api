const router = require("express").Router();
const messageController = require("../controllers/messageController");
const { isAuthenticated } = require("../middleware/auth");
const { uploadFiles } = require("../middleware/upload");

/**
 * @swagger
 * /chats/{chatId}/messages:
 *   post:
 *     summary: Send a message to a chat (the sender is the authenticated user)
 *     tags: [Messages]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Hello, doctor!"
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Message created
 */
router.post("/chats/:chatId/messages", isAuthenticated, uploadFiles.single("file"), messageController.createMessage);
/**
 * @swagger
 * /users/chats/{chatId}/messages:
 *   get:
 *     summary: Get messages of a chat (only for chat participants)
 *     tags: [Messages]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 15
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Chat with its messages
 *       404:
 *         description: Chat not found or the user is not a participant
 */
router.get("/users/chats/:chatId/messages", isAuthenticated, messageController.getMessages);
/**
 * @swagger
 * /users/messages/{messageId}:
 *   delete:
 *     summary: Delete your own message
 *     tags: [Messages]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Successful
 *       404:
 *         description: Message not found
 */
router.delete("/users/messages/:messageId", isAuthenticated, messageController.deleteMessage);

module.exports = router;
