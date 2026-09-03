const express = require("express");
const router = express.Router();
const SearchController = require("../controllers/searchController");
const { isAuthenticated, hasRole } = require("../middleware/auth");

/**
 * @swagger
 * /search/posts:
 *   get:
 *     summary: get posts by query
 *     tags: [Search]
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: Home
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Array all results
 */
router.get("/search/posts", SearchController.searchPosts);
/**
 * @swagger
 * /search/patients:
 *   get:
 *     summary: get patient by query
 *     tags: [Search]
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: Home
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: array all patient
 */
router.get("/search/patients", isAuthenticated, hasRole(["clinic", "doctor", "admin"]), SearchController.searchPatients);
/**
 * @swagger
 * /search/doctors:
 *   get:
 *     summary: get doctor by query
 *     tags: [Search]
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: Home
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: array doctors
 */
router.get("/search/doctors", isAuthenticated, hasRole(["clinic", "admin"]), SearchController.searchDoctors);
/**
 * @swagger
 * /search/clinics:
 *   get:
 *     summary: get clinics by query
 *     tags: [Search]
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: Home
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: array clinics
 */
router.get("/search/clinics", isAuthenticated, hasRole("admin"), SearchController.searchClinics);
/**
 * @swagger
 * /search/prescriptions:
 *   get:
 *     summary: get prescriptions by query
 *     tags: [Search]
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: Home
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: array prescriptions
 */
router.get("/search/prescriptions", isAuthenticated, hasRole("doctor"), SearchController.searchPrescriptions);

module.exports = router; 