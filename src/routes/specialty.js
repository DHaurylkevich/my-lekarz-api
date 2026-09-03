const express = require("express");
const router = express.Router();
const specialtyController = require("../controllers/specialtyController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
/**
 * @swagger
 * /specialties:
 *   post:
 *     summary: Creates a specialty, only the admin does
 *     tags: [Specialties]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Doctor"
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
 *                   example: "Doctor"
 */
router.post("/specialties", isAuthenticated, hasRole('admin'), specialtyController.createSpecialty);
/**
 * @swagger
 * /specialties:
 *   get:
 *     summary: get all specialties
 *     tags: [Specialties]
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
 *                     example: "doctor"
 */
router.get("/specialties", specialtyController.getAllSpecialties);
/**
 * @swagger
 * /clinic/{clinicId}/specialties:
 *   get:
 *     summary: Receive all specialties and all services related to the clinic
 *     tags: [Specialties]
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
 *                     example: "Doctor"
 *                   services:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: "Service name"
 *                         price:
 *                           type: number
 *                           example: "10.02"
 */
router.get("/clinic/:clinicId/specialties", specialtyController.getAllSpecialtiesByClinic);
/**
 * @swagger
 * /clinic/{clinicId}/specialties/doctors:
 *   get:
 *     summary: Receive all specialties and doctors by clinic ID
 *     tags: [Specialties]
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
 *                     example: "Doctor"
 *                   doctors:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         user:
 *                           type: object
 *                           properties:
 *                              first_name:
 *                                  type: string
 *                                  example: "Dana"
 *                              last_name:
 *                                  type: string
 *                                  example: "Hospilna"
 */
router.get("/clinic/:clinicId/specialties/doctors", specialtyController.getAllSpecialtiesByClinicWithDoctor);
/**
 * @swagger
 * /specialties/{specialtyId}:
 *   get:
 *     summary: get specialty by id
 *     tags: [Specialties]
 *     parameters:
 *       - name: specialtyId
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
 *                   example: "Doctor"
 */
router.get("/specialties/:specialtyId", specialtyController.getSpecialty);
/**
 * @swagger
 * /specialties/{specialtyId}:
 *   put:
 *     summary: update specialty
 *     tags: [Specialties]
 *     parameters:
 *       - name: specialtyId
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
 *                 example: "new name"
 *             required:
 *               - name
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Specialty updated successfully"
 */
router.put("/specialties/:specialtyId", isAuthenticated, hasRole('admin'), specialtyController.updateSpecialty);
/**
 * @swagger
 * /specialties/{specialtyId}:
 *   delete:
 *     summary: delete update
 *     tags: [Specialties]
 *     parameters:
 *       - name: specialtyId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Specialty deleted successfully"
 */
router.delete("/specialties/:specialtyId", isAuthenticated, hasRole('admin'), specialtyController.deleteSpecialty);

module.exports = router;