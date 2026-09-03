const express = require("express");
const router = express.Router();
const DocumentController = require("../controllers/documentController");
const upload = require("../middleware/upload").uploadFiles;
const { isAuthenticated, hasRole } = require("../middleware/auth");

/**
 * @swagger
 * /doctors/documents/{patientId}:
 *   post:
 *     summary: Add the document to patient
 *     tags: [Documents]
 *     parameters:
 *       - name: patientId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Document uploaded successfully"
 */
router.post("/doctors/documents/:patientId", isAuthenticated, hasRole("doctor"), upload.single("file"), DocumentController.addDocument);
/**
 * @swagger
 * /doctors/documents/{patientId}:
 *   get:
 *     summary: Get all patient's documents for the doctor
 *     tags: [Documents]
 *     parameters:
 *       - name: patientId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pages:
 *                   type: integer
 *                   example: 1
 *                 documents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: File name
 *                       link:
 *                         type: string
 *                         example: "https://example.com"
 */
router.get("/doctors/documents/:patientId", isAuthenticated, hasRole("doctor"), DocumentController.getDocumentsForDoctors);
/**
 * @swagger
 * /patients/documents:
 *   get:
 *     summary: Get documents for the patient
 *     tags: [Documents]
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pages:
 *                   type: integer
 *                   example: 1
 *                 documents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: File name
 *                       link:
 *                         type: string
 *                         example: "https://example.com"
 */
router.get("/patients/documents", isAuthenticated, hasRole("patient"), DocumentController.getDocumentsForPatient);

module.exports = router;