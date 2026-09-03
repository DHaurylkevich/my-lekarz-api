const express = require("express");
const router = express.Router();
const TagController = require("../controllers/tagController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { validateBody } = require("../utils/validation");
const { validateRequest } = require("../middleware/errorHandler");

/**
 * @swagger
 * /tags:
 *   post:
 *     summary: create a new tag
 *     tags: [Tags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Tag's name"
 *             required:
 *               - name
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Tag's name"
 *                 positive:
 *                   type: boolean
 *                   example: true
 */
router.post("/tags", validateBody("name"), validateRequest, isAuthenticated, hasRole("admin"), TagController.createTag);
/**
 * @swagger
 * /tags:
 *   get:
 *     summary: get all tags
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: Массив всех тэгов
 */
router.get("/tags", isAuthenticated, TagController.getAllTags);
/**
 * @swagger
 * /tags/{tagId}:
 *   put:
 *     summary: update tag
 *     tags: [Tags]
 *     parameters:
 *       - name: tagId
 *         in: path
 *         required: true
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
 *               name:
 *                 type: string
 *                 example: "New tag"
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Тэг успешно обновлен
 */
router.put("/tags/:tagId", isAuthenticated, hasRole("admin"), TagController.updateTag);
/**
 * @swagger
 * /tags/{tagId}:
 *   delete:
 *     summary: delete the tag
 *     tags: [Tags]
 *     parameters:
 *       - name: tagId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Таг успешно удален
 */
router.delete("/tags/:tagId", isAuthenticated, hasRole("admin"), TagController.deleteTag);

module.exports = router;