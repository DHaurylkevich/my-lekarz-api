const express = require("express");
const router = express.Router();
const NotionController = require("../controllers/notionController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { validateBody } = require("../utils/validation");
const { validateRequest } = require("../middleware/errorHandler")

/**
 * @swagger
 * /notions:
 *   post:
 *     summary: Create a new notion
 *     tags: [Notions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Notion text"
 *             required:
 *               - content
 *     responses:
 *       201:
 *         description: Notion successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 content:
 *                   type: string
 *                   example: "Notion text"
 */
router.post("/notions", validateBody("content"), validateRequest, isAuthenticated, hasRole("admin"), NotionController.createNotion);
/**
 * @swagger
 * /notions:
 *   get:
 *     summary: Get all notions
 *     tags: [Notions]
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                     example: 1
 *                   content:
 *                     type: string
 *                     example: "Notion content"
 */
router.get("/notions", isAuthenticated, hasRole("admin"), NotionController.getAllNotions);
/**
 * @swagger
 * /notions/{notionId}:
 *   put:
 *     summary: Update a notion
 *     tags: [Notions]
 *     parameters:
 *       - name: notionId
 *         in: path
 *         required: true
 *         description: notion ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Updated notion content"
 *             required:
 *               - content
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *                   example: "Updated notion content"
 */
router.put("/notions/:notionId", validateBody("content"), validateRequest, isAuthenticated, hasRole("admin"), NotionController.updateNotion);
/**
 * @swagger
 * /notions/{notionId}:
 *   delete:
 *     summary: Delete a notion
 *     tags: [Notions]
 *     parameters:
 *       - name: notionId
 *         in: path
 *         required: true
 *         description: notion ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Notion successfully deleted"
 */
router.delete("/notions/:notionId", isAuthenticated, hasRole("admin"), NotionController.deleteNotion);

module.exports = router;