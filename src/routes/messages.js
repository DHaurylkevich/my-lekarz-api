const router = require("express").Router();
const messageController = require("../controllers/messageController");
const { uploadFiles } = require("../middleware/upload");

router.post("/chats/:chatId/messages", uploadFiles.single("file"), messageController.createMessage);
/**
 * @swagger
 * /chats/{chatId}/messages:
 *   get:
 *     summary: get message by chatId
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Message's array
 */
router.get("/users/chats/:chatId/messages", messageController.getMessages);
/**
 * @swagger
 * /users/messages/{messageId}:
 *   delete:
 *     summary: delete message
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Successful
 */
router.delete("/users/messages/:messageId", messageController.deleteMessage);

module.exports = router;