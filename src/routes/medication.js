const express = require("express");
const MedicationController = require("../controllers/medicationController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { validateBody } = require("../utils/validation");
const { validateRequest } = require("../middleware/errorHandler");
const router = express.Router();

/**
 * @swagger
 * /medications:
 *   post:
 *     summary: Create a new medication
 *     tags: [Medications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Aspirin"
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
 *                   example: "Aspirin"
 */
router.post("/medications", validateBody("name"), validateRequest, isAuthenticated, hasRole("admin"), MedicationController.createMedication);
/**
 * @swagger
 * /medications:
 *   get:
 *     summary: Get all medications
 *     tags: [Medications]
 *     responses:
 *       200:
 *         description: List of medications
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
 *                     example: "Aspirin"
 */
router.get("/medications", isAuthenticated, MedicationController.getAllMedications);
/**
 * @swagger
 * /medications/{medicationId}:
 *   put:
 *     summary: Update medication information
 *     tags: [Medications]
 *     parameters:
 *       - in: path
 *         name: medicationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: medication ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Ibuprofen"
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Aspirin"
 */
router.put("/medications/:medicationId", validateBody("name"), validateRequest, isAuthenticated, hasRole("admin"), MedicationController.updateMedication);
/**
 * @swagger
 * /medications/{medicationId}:
 *   delete:
 *     summary: Delete medication
 *     tags: [Medications]
 *     parameters:
 *       - in: path
 *         name: medicationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: medication ID
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Medication deleted successfully"
 */
router.delete("/medications/:medicationId", isAuthenticated, hasRole("admin"), MedicationController.deleteMedication);

module.exports = router;