const express = require("express");
const router = express.Router();
const ScheduleController = require("../controllers/scheduleController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { createSchedule } = require("../utils/validation/scheduleValidator");
const { validateRequest } = require("../middleware/errorHandler");

/**
 * @swagger
 * /clinics/schedules:
 *   post:
 *     summary: Creating a new schedule
 *     description: Creates a new schedule for one or more doctors
 *     tags: [Schedules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctorsIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [4]
 *               interval:
 *                 type: integer
 *                 example: 30
 *               dates:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: date
 *                   example: "2024-11-10"
 *               start_time:
 *                 type: string
 *                 format: time
 *                 example: "09:00"
 *               end_time:
 *                 type: string
 *                 format: time
 *                 example: "12:00"
 *     responses:
 *       201:
 *           content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   available_slots:
 *                     type: array
 *                     items:
 *                       type: string
 *                       example: "09:00"
 *                   id:
 *                     type: integer
 *                     example: 362
 *                   interval:
 *                     type: integer
 *                     example: 30
 *                   start_time:
 *                     type: string
 *                     format: time
 *                     example: "09:00:00"
 *                   end_time:
 *                     type: string
 *                     format: time
 *                     example: "12:00:00"
 *                   date:
 *                     type: string
 *                     format: date
 *                     example: "2024-11-10"
 *                   clinic_id:
 *                     type: integer
 *                     example: 187
 *                   doctor_id:
 *                     type: integer
 *                     example: 197
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-01-14T08:53:21.933Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-01-14T08:53:21.933Z"
 */
router.post("/clinics/schedules", createSchedule, validateRequest, isAuthenticated, hasRole("clinic"), ScheduleController.createSchedule)
/**
 * @swagger
 * /schedules:
 *   get:
 *     summary: "Get a schedule for the DOCTOR role, or a schedule of all doctors for the CLINIC role"
 *     tags: [Schedules]
 *     parameters:
 *       - name: year
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: month
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: doctorIds
 *         in: query
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array of doctor IDs
 *           example: [1, 2, 3]
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalHours:
 *                   type: number
 *                   example: 2
 *                 schedules:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                         example: 1
 *                       interval:
 *                         type: number
 *                         example: 30
 *                       date:
 *                         type: date
 *                         example: "2025-01-25"
 *                       start_time:
 *                         type: string
 *                         example: "09:00:00"
 *                       end_time:
 *                         type: string
 *                         example: "09:00:00"
 *                       doctor:
 *                         type: object
 *                         properties:
 *                           rating:
 *                             type: number
 *                             example: 2.5
 *                           description:
 *                             type: string
 *                             example: "Nisi aliquam reiciendis blanditiis hic perferendis facere commodi quisquam provident"
 *                           user:
 *                             type: object
 *                             properties:
 *                               first_name:
 *                                 type: string
 *                                 example: "Charlotte"
 *                               last_name:
 *                                 type: string
 *                                 example: "Schumm"
 *                               photo:
 *                                 type: string
 *                                 example: "http://example.com"
 */
router.get("/schedules", isAuthenticated, hasRole(["clinic", "doctor"]), ScheduleController.getScheduleByRole);
/**
 * @swagger
 * /schedules/available-slots:
 *   get:
 *     summary: Get available slots for doctor's appointments 
 *     tags: [Schedules]
 *     parameters:
 *       - name: city
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: specialty
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: date
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *       - name: visitType
 *         in: query
 *         required: false
 *         schema:
 *           type: string
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
 *                 totalCount:
 *                   type: number
 *                   example: 32
 *                 pages:
 *                   type: number
 *                   example: 32
 *                 slots:
 *                   type: array
 *                   items: 
 *                     type: object 
 *                     properties:
 *                       doctor_id:
 *                         type: integer
 *                         example: 1
 *                       description:
 *                         type: string
 *                         example: "Ascisco caritas minima surgo patrocinor crustulum"
 *                       rating:
 *                         type: number
 *                         format: float
 *                         example: 4.5
 *                       specialty:
 *                         type: string
 *                         example: "Associate"
 *                       user:
 *                         type: object
 *                         properties:
 *                           first_name:
 *                             type: string
 *                           last_name:
 *                             type: string
 *                           photo:
 *                             type: string
 *                             example: "http://example.com"
 *                           phone:
 *                             type: string
 *                             example: "1"
 *                       clinic:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "Kaczmarczyk"
 *                           address:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: number
 *                               city:
 *                                 type: string
 *                               street:
 *                                 type: string
 *                               home:
 *                                 type: string
 *                                 example: "1"
 *                               flat:
 *                                 type: string
 *                                 example: "1"
 *                               post_index:
 *                                 type: string
 *                                 example: "1"
 *                       service:
 *                         type: array
 *                         items: 
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: number
 *                             name:
 *                               type: string
 *                               example: "Table"
 *                             price:
 *                               type: number
 *                               example: "258.66"
 *                       available_slots:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             date:
 *                               type: string
 *                               format: date
 *                               example: "2024-11-05"
 *                             slots:
 *                               type: array
 *                               items:
 *                                 example: "10:00"
 */
router.get("/schedules/available-slots", ScheduleController.getAvailableSlotsWithFilter);
/**
 * @swagger
 * /schedules/{scheduleId}:
 *   get:
 *     summary: Get a schedule by id
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: scheduleId
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
 *                   example: 393
 *                 interval:
 *                   type: integer
 *                   example: 30
 *                 start_time:
 *                   type: string
 *                   format: time
 *                   example: "09:00:00"
 *                 end_time:
 *                   type: string
 *                   format: time
 *                   example: "12:00:00"
 *                 date:
 *                   type: string
 *                   format: date
 *                   example: "2024-11-10"
 *                 doctor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 249
 *                     user:
 *                       type: object
 *                       parameters: 
 *                         first_name: 
 *                           type: string 
 *                           example: "Miki" 
 *                         last_name: 
 *                           type: string 
 *                           example: "Mice" 
 *                         photo: 
 *                           type: string 
 *                           example: "http://example.com" 
 *                 clinic:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "proactive"
 */
router.get("/schedules/:scheduleId", ScheduleController.getScheduleById);
/**
 * @swagger
 * /schedules/{scheduleId}:
 *   put:
 *     summary: update the schedule by id
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: scheduleId
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
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-11-15"
 *               start_time:
 *                 type: string
 *                 format: time
 *                 example: "10:00"
 *               end_time:
 *                 type: string
 *                 format: time
 *                 example: "13:00"
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 393
 *                 interval:
 *                   type: integer
 *                   example: 30
 *                 available_slots:
 *                   type: array
 *                   items: 
 *                     type: string
 *                     example: "10:00"
 *                 date:
 *                   type: date
 *                   example: "2024-11-15"
 *                 start_time:
 *                   type: string
 *                   example: "10:00"
 *                 end_time:
 *                   type: string
 *                   example: "13:00"
 */
router.put("/schedules/:scheduleId", isAuthenticated, hasRole("clinic"), ScheduleController.updateSchedule);
/**
 * @swagger
 * /schedules/{scheduleId}:
 *   delete:
 *     summary: delete the schedule
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: scheduleId
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
 *                 message:
 *                   type: integer
 *                   example: "Schedule deleted successfully"
 */
router.delete("/schedules/:scheduleId", isAuthenticated, hasRole("clinic"), ScheduleController.deleteSchedule);

module.exports = router;