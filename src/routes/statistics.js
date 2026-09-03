const express = require("express");
const router = express.Router();
const StatisticController = require("../controllers/statisticController");
const { isAuthenticated, hasRole } = require("../middleware/auth");

/**
 * @swagger
 * /doctors/statistics:
 *   get:
 *     summary: Get total number of patients, visits and percent change
 *     description: Returns the total number of patients and percentage of change in the system. Without a date, this month's information will be returned
 *     tags: [Statistics]
 *     parameters:
 *       - in: query
 *         name: startOfMonth
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-12-01"
 *         description: Optional start date for filtering statistics
 *       - in: query
 *         name: endOfMonth
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *         description: Optional end date for filtering statistics
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 countPatients:
 *                   type: object
 *                   properties: 
 *                     percentageChange: 
 *                       type: number 
 *                       example: 0 
 *                     totalCount: 
 *                       type: number 
 *                       example: 1
 *                 countAppointments:
 *                   type: object
 *                   properties: 
 *                     percentageChange: 
 *                       type: number 
 *                       example: 0 
 *                     totalCount: 
 *                       type: number 
 *                       example: 1
 *                     totalCountToday: 
 *                       type: number 
 *                       example: 1
 */
router.get("/doctors/statistics", isAuthenticated, hasRole("doctor"), StatisticController.getDoctorStatistics);
/**
 * @swagger
 * /clinics/statistics:
 *   get:
 *     summary: Get the total number of patients, average rating and percent of change
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 averageRating:
 *                   type: object
 *                   properties: 
 *                     percentageChange: 
 *                       type: number 
 *                       example: 0 
 *                     currentRating: 
 *                       type: number 
 *                       example: 1
 *                 countPatients:
 *                   type: object
 *                   properties: 
 *                     percentageChange: 
 *                       type: number 
 *                       example: 0 
 *                     totalCount: 
 *                       type: number 
 *                       example: 1
 */
router.get("/clinics/statistics", isAuthenticated, hasRole("clinic"), StatisticController.getClinicStatistics);
/**
 * @swagger
 * /admins/statistics:
 *  get:
 *    summary: Retrieve statistics for patients, clinics, doctors, and appointments
 *    description: Returns the total number and percentage change of patients, clinics, doctors, and appointments, as well as detailed information about new and all patients and clinics.
 *    tags: [Statistics]
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                countUser:
 *                  type: object
 *                  properties: 
 *                    totalPatient: 
 *                      type: number 
 *                      example: 0 
 *                    percentagePatient: 
 *                      type: number 
 *                      example: 1
 *                    totalClinic: 
 *                      type: number 
 *                      example: 1
 *                    percentageClinics: 
 *                      type: number 
 *                      example: 1
 *                    totalDoctor: 
 *                      type: number 
 *                      example: 1
 *                    percentageDoctors: 
 *                      type: number 
 *                      example: 1
 *                    totalAppointment: 
 *                      type: number 
 *                      example: 1
 *                    percentageAppointments: 
 *                      type: number 
 *                      example: 1
 *                statisticUser:
 *                  type: object
 *                  properties: 
 *                    newPatients: 
 *                      type: array 
 *                      items:
 *                        type: object
 *                        properties:
 *                          createdAt:
 *                            type: string
 *                            format: date
 *                          id:
 *                            type: string
 *                            format: date
 *                          user:
 *                            type: object
 *                            properties:
 *                              first_name:
 *                                type: string
 *                              last_name:
 *                                type: string
 *                    allPatients:
 *                      type: array
 *                      items: 
 *                        type: object
 *                        properties:
 *                          createdAt: 
 *                            type: string 
 *                            format: date
 *                    newClinics:
 *                      type: array
 *                      items: 
 *                        type: object
 *                        properties:
 *                          createdAt: 
 *                            type: string 
 *                            format: date
 *                          name: 
 *                            type: string 
 *                    allClinics:
 *                      type: array
 *                      items: 
 *                        type: object
 *                        properties:
 *                          createdAt: 
 *                            type: string 
 *                            format: date
 */
router.get("/admins/statistics", isAuthenticated, hasRole("admin"), StatisticController.getAdminStatistics);
/**
 * @swagger
 * /admins/statistics/details:
 *   get:
 *     summary: Get statistics on patients, clinics, doctors and reviews
 *     description: Get the total number of patients, clinics, doctors and appointments, as well as the average ratings of doctors, clinics and reviews.If no dates are given, the current statistics are returned.
 *     tags: [Statistics]
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-12-16"
 *         description: Start date for filtering statistics (optional)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-12-16"
 *         description: End date for filtering statistics (optional)
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 countUser:
 *                   type: object
 *                   properties:
 *                     totalPatient:
 *                       type: integer
 *                       example: 23
 *                     percentagePatient:
 *                       type: number
 *                       example: 0
 *                     totalClinic:
 *                       type: integer
 *                       example: 12
 *                     percentageClinics:
 *                       type: number
 *                       example: 0
 *                     totalDoctor:
 *                       type: integer
 *                       example: 21
 *                     percentageDoctors:
 *                       type: number
 *                       example: 0
 *                     totalAppointment:
 *                       type: integer
 *                       example: 46
 *                     percentageAppointments:
 *                       type: number
 *                       example: 0
 *                 count:
 *                   type: object
 *                   properties:
 *                     doctorRatings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           rating:
 *                             type: number
 *                             example: 4.803776759236096
 *                     cityRating:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           city:
 *                             type: string
 *                             example: "Trzebiatów"
 *                           averageRating:
 *                             type: string
 *                             example: "4.8"
 *                           address.city:
 *                             type: string
 *                             example: "Trzebiatów"
 *                     clinicsFeedback:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           feedbackRating:
 *                             type: integer
 *                             example: 1
 *                             description: Рейтинг отзыва
 *                           count:
 *                             type: string
 *                             example: "3"
 *                     patientsFeedback:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           feedbackRating:
 *                             type: integer
 *                             example: 0
 *                           count:
 *                             type: string
 *                             example: "5"
 */
router.get("/admins/statistics/details", isAuthenticated, hasRole("admin"), StatisticController.getAdminStatisticDetails);
/**
 * @swagger
 * /admins/statistics/details/file:
 *   get:
 *     summary: Get statistics on patients, clinics, doctors and reviews
 *     description: Get the total number of patients, clinics, doctors and appointments, as well as the average ratings of doctors, clinics and reviews.If no dates are given, the current statistics are returned.
 *     tags: [Statistics]
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-12-16"
 *         description: Start date for filtering statistics (optional)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-12-16"
 *         description: End date for filtering statistics (optional)
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 countUser:
 *                   type: object
 *                   properties:
 *                     totalPatient:
 *                       type: integer
 *                       example: 23
 *                     percentagePatient:
 *                       type: number
 *                       example: 0
 *                     totalClinic:
 *                       type: integer
 *                       example: 12
 *                     percentageClinics:
 *                       type: number
 *                       example: 0
 *                     totalDoctor:
 *                       type: integer
 *                       example: 21
 *                     percentageDoctors:
 *                       type: number
 *                       example: 0
 *                     totalAppointment:
 *                       type: integer
 *                       example: 46
 *                     percentageAppointments:
 *                       type: number
 *                       example: 0
 *                 count:
 *                   type: object
 *                   properties:
 *                     doctorRatings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           rating:
 *                             type: number
 *                             example: 4.803776759236096
 *                     cityRating:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           city:
 *                             type: string
 *                             example: "Trzebiatów"
 *                           averageRating:
 *                             type: string
 *                             example: "4.8"
 *                           address.city:
 *                             type: string
 *                             example: "Trzebiatów"
 *                     clinicsFeedback:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           feedbackRating:
 *                             type: integer
 *                             example: 1
 *                             description: Рейтинг отзыва
 *                           count:
 *                             type: string
 *                             example: "3"
 *                     patientsFeedback:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           feedbackRating:
 *                             type: integer
 *                             example: 0
 *                           count:
 *                             type: string
 *                             example: "5"
 */
router.get("/admins/statistics/details/file", isAuthenticated, hasRole("admin"), StatisticController.getAdminStatisticPDF);
/**
 * @swagger
 * /statistics:
 *  get:
 *    summary: Get the number of clinics by region and list province, number of doctor and specialties
 *    tags: [Statistics]
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                provinces:
 *                  type: object
 *                  properties: 
 *                    province: 
 *                      type: string 
 *                      example: "Special"
 *                    clinicCount: 
 *                      type: number 
 *                      example: 1
 *                countCity:
 *                  type: number
 *                  example: "Special"
 *                countDoctor: 
 *                  type: number 
 *                  example: 1
 *                countSpecialties: 
 *                  type: number 
 *                  example: 1
 */
router.get("/statistics", StatisticController.mainPageStatistics);

module.exports = router;