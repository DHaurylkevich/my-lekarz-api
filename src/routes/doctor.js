const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const { isAuthenticated, hasRole } = require("../middleware/auth");

/**
 * @swagger
 * /clinics/doctors:
 *   post:
 *     summary: Create a new doctor
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userData:
 *                 type: object
 *                 properties:
 *                   first_name:
 *                     type: string
 *                     example: "Stive"
 *                   last_name:
 *                     type: string
 *                     example: "Jobs"
 *                   email:
 *                     type: string
 *                     example: "jobse220@mail.com"
 *                   gender:
 *                     type: string
 *                     enum: ["male", "female"]
 *                     example: "male"
 *                   pesel:
 *                     type: string
 *                     example: "12345678901"
 *                   phone:
 *                     type: string
 *                     example: "+48123123123"
 *                   birthday:
 *                     type: string
 *                     format: date
 *                     example: "1980-01-01"
 *               addressData:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                     example: "Effertzhaven"
 *                   province:
 *                     type: string
 *                     example: "Ohio"
 *                   street:
 *                     type: string
 *                     example: "N Chestnut Street"
 *                   home:
 *                     type: string
 *                     example: "7903"
 *                   flat:
 *                     type: string
 *                     example: "495"
 *                   post_index:
 *                     type: string
 *                     example: "37428-7078"
 *               doctorData:
 *                 type: object
 *                 properties:
 *                   hired_at:
 *                     type: string
 *                     format: date
 *                     example: "2023-01-01"
 *                   description:
 *                     type: string
 *                     example: "Dr dre eeeee"
 *               specialtyId:
 *                 type: integer
 *                 example: 5
 *               servicesIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Doctor created successfully"
 */
router.post("/clinics/doctors/", isAuthenticated, hasRole("clinic"), doctorController.createDoctor);
/**
 * @swagger
 * /doctors/{doctorId}/short:
 *   get:
 *     summary: Get a short information about doctor
 *     tags: [Doctors]
 *     parameters:
 *       - name: doctorId
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
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 description:
 *                   type: string
 *                   example: "loren longer"
 *                 rating:
 *                   type: number
 *                   format: float
 *                   example: 0.5
 *                 user:
 *                   type: object
 *                   properties:
 *                     first_name:
 *                       type: string
 *                       example: "Name"
 *                     last_name:
 *                       type: string
 *                       example: "Last Name"
 *                     photo:
 *                       type: string
 *                       example: "https://example.com/"
 *                 specialty:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Special Name"
 */
router.get("/doctors/:doctorId/short", doctorController.getShortDoctorById);
/**
 * @swagger
 * /doctors/{doctorId}:
 *   get:
 *     summary: Get a doctor's information
 *     tags: [Doctors]
 *     parameters:
 *       - name: doctorId
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
 *                 id:
 *                   type: integer
 *                   example: 18
 *                 description:
 *                   type: string
 *                   example: "Tabella ager ventus cupiditate demulceo."
 *                 rating:
 *                   type: number
 *                   format: float
 *                   example: 3.3
 *                 hired_at:
 *                   type: string
 *                   example: "2024-10-04T17:41:40.320Z"
 *                 user:
 *                   type: object
 *                   properties:
 *                     first_name:
 *                       type: string
 *                       example: "Jarret"
 *                     last_name:
 *                       type: string
 *                       example: "Douglas"
 *                     gender:
 *                       type: string
 *                       example: "female"
 *                     photo:
 *                       type: string
 *                       example: "https://example.com"
 *                     phone:
 *                       type: number
 *                       example: 48358725878
 *                     email:
 *                       type: string
 *                       example: "doctor@gmail.com"
 *                     address:
 *                       type: object
 *                       properties:
 *                         city:
 *                           type: string
 *                           example: "Novogrudek"
 *                         province:
 *                           type: string
 *                           example: "Ghrodnenska"
 *                         street:
 *                           type: string
 *                           example: "st. Mickiewicha"
 *                         home:
 *                           type: string
 *                           example: "69"
 *                         flat:
 *                           type: string
 *                           example: "96"
 *                         post_index:
 *                           type: string
 *                           example: "123456"
 *                 specialty:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Agent"
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "X-ray"
 *                       price:
 *                         type: number
 *                         example: 1.21
 *                 clinic:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Larson - Schmidt"
 */
router.get("/doctors/:doctorId", doctorController.getDoctorById);
/**
 * @swagger
 * /admins/doctors:
 *   get:
 *     summary: Get all acceptable physician data for admin
 *     tags: [Doctors]
 *     parameters:
 *       - name: gender
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [male, female]
 *           example: "male"
 *       - name: sort
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: "asc"
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 18
 *                 description:
 *                   type: string
 *                   example: "Tabella ager ventus cupiditate demulceo."
 *                 rating:
 *                   type: number
 *                   format: float
 *                   example: 3.4528073983690954
 *                 hired_at:
 *                   type: string
 *                   example: "2024-10-04T17:41:40.320Z"
 *                 user:
 *                   type: object
 *                   properties:
 *                     first_name:
 *                       type: string
 *                       example: "Jarret"
 *                     last_name:
 *                       type: string
 *                       example: "Douglas"
 *                     gender:
 *                       type: string
 *                       example: "female"
 *                     photo:
 *                       type: string
 *                       example: "https://exapmle.com"
 *                     email:
 *                       type: string
 *                       example: "doctor@gmail.com"
 *                     address:
 *                       type: object
 *                       properties:
 *                         city:
 *                           type: string
 *                           example: "Novogrudek"
 *                         province:
 *                           type: string
 *                           example: "Ghrodnenska"
 *                         street:
 *                           type: string
 *                           example: "st. Mickiewicha"
 *                         home:
 *                           type: string
 *                           example: "69"
 *                         flat:
 *                           type: string
 *                           example: "96"
 *                         post_index:
 *                           type: string
 *                           example: "123456"
 *                 specialty:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Agent"
 *                 clinic:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Larson - Schmidt"
 */
router.get("/admins/doctors", isAuthenticated, hasRole("admin"), doctorController.getAllDoctorsForAdmin);
/**
 * @swagger
 * /clinics/doctors/{doctorId}:
 *   put:
 *     summary: A clinic can update their doctor's information 
 *     tags: [Doctors]
 *     parameters:
 *       - name: doctorId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userData:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     example: "new_email@gmail.com"
 *                   phone:
 *                     type: string
 *                     example: "+1234567890"
 *               addressData:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                     example: "Effertzhaven"
 *                   province:
 *                     type: string
 *                     example: "Ohio"
 *                   street:
 *                     type: string
 *                     example: "N Chestnut Street"
 *                   home:
 *                     type: integer
 *                     example: "7903"
 *                   flat:
 *                     type: integer
 *                     example: "495"
 *                   post_index:
 *                     type: string
 *                     example: "37428-7078"
 *               doctorData:
 *                 type: object
 *                 properties:
 *                   hired_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-11-13T07:29:36.618Z"
 *                   description:
 *                     type: string
 *                     example: "Corroboro avaritia pecto suadeo. Claudeo aestas comitatus. Benigne spargo appono denuncio terra."
 *                   specialty_id:
 *                     type: integer
 *                     example: 2
 *               servicesIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [2]
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Doctor update successfully"
 */
router.put("/clinics/doctors/:doctorId", isAuthenticated, hasRole("clinic"), doctorController.updateDoctorById);
/**
 * @swagger
 * /clinics/{clinicId}/doctors:
 *   get:
 *     summary: Get all doctors associated with one clinic with filtering
 *     tags: [Doctors]
 *     parameters:
 *       - name: clinicId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: gender
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [male, female]
 *           example: "male"
 *       - name: sort
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: "asc"
 *         description: Sorting by name
 *       - name: ratingSort
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: "asc"
 *         description: Sorting by rating
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: specialtyId
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
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
 *                     example: 18
 *                   rating:
 *                     type: number
 *                     example: 1.231
 *                   user:
 *                     type: object
 *                     properties:
 *                       first_name:
 *                         type: string
 *                         example: "Janiya"
 *                       photo:
 *                         type: string
 *                         example: "http://example.com"
 *                       last_name:
 *                         type: string
 *                         example: "Ward"
 *                       gender:
 *                         type: string
 *                         example: "female"
 *                   specialty:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Associate"
 */
router.get("/clinics/:clinicId/doctors", doctorController.getDoctorsByClinicWithSorting);
/**
 * @swagger
 * /clinics/doctors/{doctorId}:
 *   delete:
 *     summary: Delete doctor
 *     tags: [Doctors]
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
 *               type: object
 *               properties:
 *                 messages:
 *                   type: string
 *                   example: "Doctor deleted successfully"
 */
router.delete("/clinics/doctors/:doctorId", doctorController.deleteDoctor);

module.exports = router;