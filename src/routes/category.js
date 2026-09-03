const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/categoryController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { validateBody } = require("../utils/validation");
const { validateRequest } = require("../middleware/errorHandler");

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
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
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 */
router.post("/categories", validateBody("name"), validateRequest, isAuthenticated, hasRole("admin"), CategoryController.createCategory);
/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
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
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Category's name"
 */
router.get("/categories", CategoryController.getAllCategories);
/**
 * @swagger
 * /categories/{categoryId}:
 *   put:
 *     summary: Update category
 *     tags: [Categories]
 *     parameters:
 *       - name: categoryId
 *         in: path
 *         required: true
 *         description: category ID
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
 *                 name:
 *                 type: string
 *                 example: "New category name"
 *             required:
 *               - name
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "New category name"
 */
router.put("/categories/:categoryId", validateBody("name"), validateRequest, isAuthenticated, hasRole("admin"), CategoryController.updateCategory);
/**
 * @swagger
 * /categories/{categoryId}:
 *   put:
 *   delete:
 *     summary: Delete the category
 *     tags: [Categories]
 *     parameters:
 *       - name: categoryId
 *         in: path
 *         required: true
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
 *                   example: "Category deleted successfully"
 */
router.delete("/categories/:categoryId", isAuthenticated, hasRole("admin"), CategoryController.deleteCategory);

module.exports = router; 