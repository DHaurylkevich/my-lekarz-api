const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { serviceCreateValidation } = require('../utils/validation');
const { validateRequest } = require('../middleware/errorHandler');

/**
 * @swagger
 * /clinics/services:
 *   post:
 *     summary: Create a new service
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Services"
 *               specialtyId:
 *                 type: number
 *                 example: 1
 *               price:
 *                 type: number
 *                 example: 10.20
 *             required:
 *               - name
 *               - specialtyId
 *               - price
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
 *                   example: "Название сервиса"
 *                 price:
 *                   type: string
 *                   example: "10.10"
 */
router.post("/clinics/services", serviceCreateValidation, validateRequest, isAuthenticated, hasRole("clinic"), serviceController.createService);
/**
 * @swagger
 * /clinics/{clinicId}/services:
 *   get:
 *     summary: get all services dor clinic by clinic's id
 *     tags: [Services]
 *     parameters:
 *       - name: clinicId
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
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Service's name"
 *                   price:
 *                     type: string
 *                     example: "10.10"
 */
router.get("/clinics/:clinicId/services", serviceController.getServicesByClinic);
/**
 * @swagger
 * /services/{serviceId}:
 *   get:
 *     summary: get service by id 
 *     tags: [Services]
 *     parameters:
 *       - name: serviceId
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
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Service's name"
 *                 price:
 *                   type: string
 *                   example: "10.10"
 */
router.get("/services/:serviceId", serviceController.getServiceById);
/**
 * @swagger
 * /doctors/{doctorId}/services:
 *   get:
 *     summary: get all services for doctor by doctor id
 *     tags: [Services]
 *     parameters:
 *       - name: doctorId
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
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   service:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Service's name"
 *                       price:
 *                         type: integer
 *                         example: 16.23
 */
router.get("/doctors/:doctorId/services", serviceController.getServicesByDoctor);
/**
 * @swagger
 * /clinics/services/{serviceId}:
 *   put:
 *     summary: Update service by service's id
 *     tags: [Services]
 *     parameters:
 *       - name: serviceId
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
 *                 example: "Service's name"
 *               specialtyId:
 *                 type: number
 *                 example: 1
 *               price:
 *                 type: number
 *                 example: 10.20
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Service updated successfully"
 */
router.put("/clinics/services/:serviceId", isAuthenticated, hasRole("clinic"), serviceController.updateService);
/**
 * @swagger
 * /clinics/services/{serviceId}:
 *   delete:
 *     summary: delete service
 *     tags: [Services]
 *     parameters:
 *       - name: serviceId
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
 *                   example: "Service deleted successfully"
 */
router.delete("/clinics/services/:serviceId", isAuthenticated, hasRole("clinic"), serviceController.deleteService);

module.exports = router;