const express = require("express");
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/auth');
const ClinicController = require("../controllers/clinicController");

/**
 * @swagger
 * /clinics:
 *   post:
 *     summary: Create a new clinic
 *     description: Creates a new clinic with a link to an address. The link comes out crooked because you need the correct page address to reset the password
 *     tags: [Clinics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clinicData:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Durka"
 *                   nip:
 *                     type: string
 *                     example: "1234567890"
 *                   nr_license:
 *                     type: string
 *                     example: "NR-123456"
 *                   email:
 *                     type: string
 *                     example: "clinic@gmail.com"
 *                   phone:
 *                     type: string
 *                     example: "+123456789"
 *                   password:
 *                     type: string
 *                     example: "123456789"
 *                   description:
 *                     type: string
 *                     example: "Descripcion clinic"
 *                 required:
 *                   - name
 *                   - nip
 *                   - nr_license
 *                   - email
 *                   - password
 *               addressData:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                     example: "Novogrudok"
 *                   street:
 *                     type: string
 *                     example: "st Lenina"
 *                   province:
 *                     type: string
 *                     example: "Grodhno"
 *                   home:
 *                     type: string
 *                     example: "10"
 *                   flat:
 *                     type: string
 *                     example: "5"
 *                   post_index:
 *                     type: string
 *                     example: "123456"
 *                 required:
 *                   - city
 *                   - street
 *                   - province
 *                   - home
 *                   - flat
 *                   - post_index
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "The link for password configuration has been sent to mail"
 */
router.post("/clinics", isAuthenticated, hasRole("admin"), ClinicController.createClinic);
/**
 * @swagger
 * /clinics:
 *   get:
 *     summary: Get all clinics
 *     tags: [Clinics]
 *     parameters:
 *       - name: name
 *         in: query
 *         description: Clinic's name
 *         required: false
 *         schema:
 *           type: string
 *           example: "Durka"
 *       - name: province
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           example: "Grodhno"
 *       - name: specialty
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           example: "Peper dr"
 *       - name: city
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           example: "Novogrudok"
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
 *                 pages:
 *                   type: integer
 *                   example: 5
 *                 clinics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 142
 *                       photo:
 *                         type: string
 *                         format: uri
 *                         example: "https://loremflickr.com/3494/3839?lock=6098064564895426"
 *                       name:
 *                         type: string
 *                         example: "Chmielewski z o.o"
 *                       nip:
 *                         type: string
 *                         example: "2319406865"
 *                       nr_license:
 *                         type: string
 *                         example: "A9A8YXMCH1NV48977"
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: "clinic@gmail.com"
 *                       phone:
 *                         type: string
 *                         example: "+48848246920"
 *                       description:
 *                         type: string
 *                         example: "Sint pariatur nobis doloremque aut nulla."
 *                       rating:
 *                         type: string
 *                         example: "1.7"
 *                       address:
 *                         type: object
 *                         properties:
 *                           city:
 *                             type: string
 *                             example: "Pełczyce"
 *                           province:
 *                             type: string
 *                             example: "podkarpackie"
 *                           street:
 *                             type: string
 *                             example: "wyb. Cybulski"
 *                           home:
 *                             type: string
 *                             example: "72a"
 *                           flat:
 *                             type: string
 *                             example: "87c"
 *                           post_index:
 *                             type: string
 *                             example: "83975"
 *                       services:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "Blood test'"
 *                             price:
 *                               type: string
 *                               format: decimal
 *                               example: "89.91"
 *                             specialty:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                   example: "Associate"

 */
router.get("/clinics", ClinicController.getAllClinicByParams);
/**
 * @swagger
 * /clinics:
 *   put:
 *     summary: Update clinic
 *     tags: [Clinics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clinicData:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Durka"
 *                     nip:
 *                       type: string
 *                       example: "1234567890"
 *                     nr_license:
 *                       type: string
 *                       example: "NR-123456"
 *                     email:
 *                       type: string
 *                       example: "clinic@gmail.com"
 *                     phone:
 *                       type: string
 *                       example: "+123456789"
 *                     password:
 *                       type: string
 *                       example: "123456789"
 *                     description:
 *                       type: string
 *                       example: "Descripcion clinic"
 *                 addressData:
 *                   type: object
 *                   properties:
 *                     city:
 *                       type: string
 *                       example: "Novogrudok"
 *                     street:
 *                       type: string
 *                       example: "st Lenina"
 *                     province:
 *                       type: string
 *                       example: "Grodhno"
 *                     home:
 *                       type: string
 *                       example: "10"
 *                     flat:
 *                       type: string
 *                       example: "5"
 *                     post_index:
 *                       type: string
 *                       example: "123456"
 *     responses:
 *       200:
 *         description: Clinic updated successfully
 */
router.put("/clinics", isAuthenticated, hasRole("clinic"), ClinicController.updateClinicById);
/**
 * @swagger
 * /admins/clinics:
 *   get:
 *     summary: Get all the clinics for the admin 
 *     tags: [Clinics]
 *     parameters:
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
 *                 pages:
 *                   type: integer
 *                   example: 5
 *                 clinics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 142
 *                       photo:
 *                         type: string
 *                         format: uri
 *                         example: "https://loremflickr.com/3494/3839?lock=6098064564895426"
 *                       name:
 *                         type: string
 *                         example: "Chmielewski z o.o"
 *                       nip:
 *                         type: string
 *                         example: "2319406865"
 *                       nr_license:
 *                         type: string
 *                         example: "A9A8YXMCH1NV48977"
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: "clinic@gmail.com"
 *                       phone:
 *                         type: string
 *                         example: "+48848246920"
 *                       createdAt:
 *                         type: string
 *                         example: "2025-01-28T15:23:08.765Z"
 *                       doctorCount:
 *                         type: number
 *                         example: 0
 *                       address:
 *                         type: object
 *                         properties:
 *                           city:
 *                             type: string
 *                             example: "Pełczyce"
 *                           province:
 *                             type: string
 *                             example: "podkarpackie"
 *                           street:
 *                             type: string
 *                             example: "wyb. Cybulski"
 *                           home:
 *                             type: string
 *                             example: "72a"
 *                           flat:
 *                             type: string
 *                             example: "87c"
 *                           post_index:
 *                             type: string
 *                             example: "83975"
 *                       timetables:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             day_of_week:
 *                               type: number
 *                               example: 7
 *                             start_time:
 *                               type: string
 *                               example: "08:00"
 *                             end_time:
 *                               type: string
 *                               example: "18:00"
 */
router.get("/admins/clinics", isAuthenticated, hasRole("admin"), ClinicController.getAllClinicsForAdmin);
/**
 * @swagger
 * /clinics/cities:
 *   get:
 *     summary: Get a list of all cities with clinics
 *     tags: [Clinics]
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   city:
 *                       type: string
 *                       exemple: "Warszawa"
 *                   province:
 *                       type: string
 *                       exemple: "Mazowieckie"
 */
router.get("/clinics/cities", ClinicController.getAllCities);
/**
 * @swagger
 * /clinics/{clinicId}:
 *   get:
 *     summary: Get full information for clinic
 *     description: Returns details of the clinic, including address and related services
 *     tags: [Clinics]
 *     parameters:
 *       - name: clinicId
 *         in: path
 *         required: true
 *         description: clinic's ID
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
 *                 pages:
 *                   type: integer
 *                   example: 5
 *                 clinics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 142
 *                       photo:
 *                         type: string
 *                         format: uri
 *                         example: "https://loremflickr.com/3494/3839?lock=6098064564895426"
 *                       name:
 *                         type: string
 *                         example: "Chmielewski z o.o"
 *                       nip:
 *                         type: string
 *                         example: "2319406865"
 *                       nr_license:
 *                         type: string
 *                         example: "A9A8YXMCH1NV48977"
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: "clinic@gmail.com"
 *                       phone:
 *                         type: string
 *                         example: "+48848246920"
 *                       createdAt:
 *                         type: string
 *                         example: "2025-01-28T15:23:08.765Z"
 *                       doctorCount:
 *                         type: number
 *                         example: 0
 *                       address:
 *                         type: object
 *                         properties:
 *                           city:
 *                             type: string
 *                             example: "Pełczyce"
 *                           province:
 *                             type: string
 *                             example: "podkarpackie"
 *                           street:
 *                             type: string
 *                             example: "wyb. Cybulski"
 *                           home:
 *                             type: string
 *                             example: "72a"
 *                           flat:
 *                             type: string
 *                             example: "87c"
 *                           post_index:
 *                             type: string
 *                             example: "83975"
 *                       timetables:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             day_of_week:
 *                               type: number
 *                               example: 7
 *                             start_time:
 *                               type: string
 *                               example: "08:00"
 *                             end_time:
 *                               type: string
 *                               example: "18:00"
 */
router.get("/clinics/:clinicId", ClinicController.getFullClinic);

module.exports = router;