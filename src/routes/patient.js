const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const { isAuthenticated, hasRole } = require("../middleware/auth");

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Get patients by records with filtering
 *     description: Returns a list of patients by records in clinics/doctors with specified filters
 *     tags: [Patients]
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
 *         description: Список пациентов успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pages:
 *                   type: integer
 *                   example: 1
 *                 patients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 128
 *                       patient:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 270
 *                           user:
 *                             type: object
 *                             properties:
 *                               first_name:
 *                                 type: string
 *                                 example: "Beatrycze"
 *                               last_name:
 *                                 type: string
 *                                 example: "Socha"
 *                               phone:
 *                                 type: string
 *                                 example: "48781562794"
 *                               photo:
 *                                 type: string
 *                                 format: uri
 *                                 example: "https://avatars.githubusercontent.com/u/66274453"
 *                               gender:
 *                                 type: string
 *                                 example: "female"
 *                               address:
 *                                 type: object
 *                                 properties:
 *                                   city:
 *                                     type: string
 *                                     example: "Wałcz"
 *                                   home:
 *                                     type: string
 *                                     example: "8/8"
 *                                   street:
 *                                     type: string
 *                                     example: "szosa Janik"
 *                                   flat:
 *                                     type: string
 *                                     example: "18"
 *                                   post_index:
 *                                     type: string
 *                                     example: "14094"
 */
router.get("/patients", isAuthenticated, hasRole(["doctor", "clinic"]), patientController.getPatientsFilter);
/**
 * @swagger
 * /patients/{patientId}:
 *   get:
 *     summary: Get patient information by ID
 *     tags: [Patients]
 *     parameters:
 *       - name: patientId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Информация о пациенте успешно получена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patient:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 283
 *                     user:
 *                       type: object
 *                       properties:
 *                         first_name:
 *                           type: string
 *                           example: "Kira"
 *                         last_name:
 *                           type: string
 *                           example: "Górka"
 *                         photo:
 *                           type: string
 *                           format: uri
 *                           example: "https://avatars.githubusercontent.com/u/70545633"
 *                         phone:
 *                           type: string
 *                           example: "+48152195769"
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: "Elwira35@yahoo.com"
 *                         birthday:
 *                           type: string
 *                           format: date-time
 *                           example: "2002-10-07T22:33:32.048Z"
 *                         gender:
 *                           type: string
 *                           example: "female"
 *                         address:
 *                           type: object
 *                           properties:
 *                             city:
 *                               type: string
 *                               example: "Reda"
 *                             home:
 *                               type: string
 *                               example: "42c"
 *                             street:
 *                               type: string
 *                               example: "skwer Kuliński"
 *                             flat:
 *                               type: string
 *                               example: "730"
 */
router.get("/patients/:patientId", isAuthenticated, hasRole(["doctor", "admin"]), patientController.getPatientById);
/**
 * @swagger
 * /admins/patients:
 *   get:
 *     summary: Get all patients for admin 
 *     tags: [Patients]
 *     parameters:
 *       - name: gender 
 *         in : query 
 *         required : false 
 *         schema :
 *           type : string 
 *           enum : [male, female] 
 *           example : "male" 
 *       - name : sort 
 *         in : query 
 *         required : false 
 *         schema :
 *           type : string 
 *           enum : [asc, desc] 
 *           example : "asc" 
 *       - name : limit 
 *         in : query 
 *         required : false 
 *         schema :
 *           type : integer 
 *           default : 10 
 *       - name : page 
 *         in : query 
 *         required : false 
 *         schema :
 *           type : integer 
 *           default : 1 
 *     responses :
 *       200 :
 *         description : Список пациентов для администратора успешно получен 
 *         content :
 *           application/json :
 *             schema :
 *               type : object 
 *               properties :
 *                 pages :
 *                   type : number 
 *                   example : 2 
 *                 patients :
 *                   type : array 
 *                   items :
 *                     type : object 
 *                     properties :
 *                       user :
 *                         type : object 
 *                         properties :
 *                           first_name :
 *                             type : string 
 *                             example : "Wiara" 
 *                           last_name :
 *                             type : string 
 *                             example : "Paszkowski" 
 *                           gender :
 *                             type : string 
 *                             example : "male" 
 *                           createdAt :
 *                             type : string 
 *                             format : date-time 
 *                             example : "2025-01-28T15：23：08.392Z" 
 *                           birthday :
 *                             type : string 
 *                             format : date-time  
 *                             example : "2005-02-12T21：26：21.005Z" 
 */
router.get("/admins/patients", isAuthenticated, hasRole("admin"), patientController.getAllPatientsForAdmin);

module.exports = router;