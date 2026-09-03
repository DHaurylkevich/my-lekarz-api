const express = require("express");
const router = express.Router();
const AppointmentController = require("../controllers/appointmentController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { validateRequest } = require('../middleware/errorHandler');;
const validation = require('../utils/validation/appointmentValidation');
const { validateParam } = require('../utils/validation');

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Creates a doctor's appointment by user
 *     tags: [Appointments]
 *     requestBody:
 *       description: Data for creating an appointment
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctorId:
 *                 type: integer
 *                 example: 1
 *                 description: doctor's ID
 *               serviceId:
 *                 type: integer
 *                 example: 1
 *                 description: service's ID
 *               clinicId:
 *                 type: integer
 *                 example: 1
 *                 description: clinic's ID
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-11-05"
 *               timeSlot:
 *                 type: string
 *                 example: "10:00"
 *                 description: Time slot for doctor's appointments
 *               firstVisit:
 *                 type: boolean
 *                 enum: [true, false]
 *                 example: true
 *               visitType:
 *                 type: string
 *                 enum: ["prywatna", "NFZ"]
 *                 example: "prywatna"
 *               description:
 *                 type: string
 *                 example: "Headache"
 *     responses:
 *       201:
 *         description: Successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 clinic_id:
 *                   type: integer
 *                   example: 1
 *                 schedule_id:
 *                   type: integer
 *                   example: 1
 *                 patient_id:
 *                   type: integer
 *                   example: 1
 *                 doctor_service_id:
 *                   type: integer
 *                   example: 1
 *                 date:
 *                   type: string
 *                   format: date
 *                   example: "2024-11-05"
 *                 timeSlot:
 *                   type: string
 *                   example: "10:00:00"
 *                 description:
 *                   type: string
 *                   example: "10:00:00"
 *                 first_visit:
 *                   type: boolean
 *                   example: true
 *                 visit_type:
 *                   type: string
 *                   example: "prywatna"
 *                 status:
 *                   type: string
 *                   example: "active"
 *                 updatedAt:
 *                   type: string
 *                   example: "2025-01-30T08:50:22.072Z"
 *                 createdAt:
 *                   type: string
 *                   example: "2025-01-30T08:50:22.072Z"
 */
router.post("/appointments", isAuthenticated, hasRole("patient"), validation.createDataExist, validateRequest, AppointmentController.createAppointment);
/**
 * @swagger
 * /patients/appointments/{appointmentId}:
 *     delete:
 *       summary: Delete appointment
 *       tags: [Appointments]
 *       parameters:
 *         - name: appointmentId
 *           in: path
 *           required: true
 *           description: appointment's ID
 *           schema:
 *             type: integer
 *             example: 1
 *       responses:
 *         200:
 *           description: Successfully created
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: Appointment deleted successfully 
 */
router.delete("/patients/appointments/:appointmentId", isAuthenticated, hasRole("patient"), validateParam("appointmentId"), validateRequest, AppointmentController.deleteAppointment);
/**
 * @swagger
 * /clinics/appointments:
 *   get:
 *     summary: Get all appointments for clinic
 *     tags: [Appointments]
 *     parameters:
 *       - name: doctorId
 *         in: query
 *         required: false
 *         description: doctor's ID
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: patientId
 *         in: query
 *         required: false
 *         description: patient's ID
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: date
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-11-05"
 *       - name: active
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *           description: Get actual appointments
 *           example: true
 *       - name: specialty
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           example: "Raper"
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
 *                   pages:
 *                     type: object
 *                     example: 32
 *                   appointments:
 *                     type: object
 *                     properties:
 *                         doctor:
 *                           type: object
 *                           properties:
 *                             first_name:
 *                               type: string
 *                               example: "Adam"
 *                             last_name:
 *                               type: string
 *                               example: "Mickevich"
 *                             photo:
 *                               type: string
 *                               example: "https://avatars.githubusercontent.com/u/21392570"
 *                         patient:
 *                           type: object
 *                           properties:
 *                             first_name:
 *                               type: string
 *                               nullable: true
 *                               example: "Nulle"
 *                             last_name:
 *                               type: string
 *                               nullable: true
 *                               example: "Nulovy"
 *                             photo:
 *                               type: string
 *                               example: "https://example.com"
 *                         specialty:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "Dr Dre"
 *                         service:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "Cut arm"
 *                             price:
 *                               type: string
 *                               example: "10.20"
 *                         date:
 *                           type: string
 *                           format: date
 *                           example: "2024-11-10"
 *                         start_time:
 *                           type: string
 *                           format: time
 *                           example: "10:30"
 *                         end_time:
 *                           type: string
 *                           format: time
 *                           example: "11:00"
 */
router.get("/clinics/appointments", isAuthenticated, hasRole("clinic"), validateRequest, AppointmentController.getAppointmentsByClinic);
/**
 * @swagger
 * /doctors/appointments:
 *   get:
 *     summary: Get all appointments for doctor
 *     tags: [Appointments]
 *     parameters:
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
 *       - name: startDate
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-11-05"
 *       - name: endDate
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-11-10"
 *       - name: status
 *         in: query
 *         required: false
 *         description: Appointment's status
 *         schema:
 *           type: string
 *           enum: ['active', 'canceled', 'completed']
 *           example: "active"
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   pages:
 *                     type: object
 *                     example: 32
 *                   appointments:
 *                     type: object
 *                     properties:
 *                         date:
 *                           type: string
 *                           format: date
 *                           example: "2025-02-11"
 *                         start_time:
 *                           type: string
 *                           example: "06:02"
 *                         end_time:
 *                           type: string
 *                           example: "06:58"
 *                         description:
 *                           type: string
 *                           example: "Arbor cuius atqui viridis aduro censura."
 *                         service:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "Gorgeous Wooden Table"
 *                             price:
 *                               type: number
 *                               example: "10.66"
 *                         first_visit:
 *                           type: boolean
 *                           example: true
 *                         visit_type:
 *                           type: string
 *                           example: "NFZ"
 *                         status:
 *                           type: string
 *                           example: "completed"
 *                         patient:
 *                           type: object
 *                           properties:
 *                             patientId:
 *                               type: number
 *                               example: "1"
 *                             first_name:
 *                               type: string
 *                               example: "Mariano"
 *                             last_name:
 *                               type: string
 *                               example: "Schulist"
 *                             photo:
 *                               type: string
 *                               example: "https://avatars.githubusercontent.com/u/6199909"
 */
router.get("/doctors/appointments", isAuthenticated, hasRole("doctor"), validateRequest, AppointmentController.getAppointmentsByDoctor);
/**
 * @swagger
 * /doctors/patients/{patientId}/appointments:
 *   get:
 *     summary: Get all the patient's appointments for a doctor
 *     tags: [Appointments]
 *     parameters:
 *       - name: patientId
 *         in: path
 *         description: patient's ID
 *         schema:
 *           type: integer
 *           example: 1
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
 *         description: Array of patient's appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   pages:
 *                     type: integer
 *                     example: 32
 *                   appointments:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                           doctor:
 *                             type: object
 *                             properties:
 *                               first_name:
 *                                 type: string
 *                                 example: "Klaudia"
 *                               last_name:
 *                                 type: string
 *                                 example: "Muszynski"
 *                           specialty:
 *                             type: string
 *                             example: "Supervisor"
 *                           service:
 *                             type: string
 *                             example: "Massage"
 */
router.get("/doctors/patients/:patientId/appointments", isAuthenticated, hasRole("doctor"), validateRequest, AppointmentController.getAppointmentsByPatientId);
/**
 * @swagger
 * /patients/appointments:
 *   get:
 *     summary: Get all appointments for a patient
 *     description: Retrieves all appointments for the specified patient.
 *     tags: [Appointments]
 *     parameters:
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
 *       - name: startDate
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-11-05"
 *       - name: endDate
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-11-10"
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   pages:
 *                     type: object
 *                     example: 32
 *                   appointments:
 *                     type: object
 *                     properties:
 *                         date:
 *                           type: string
 *                           format: date
 *                           example: "2025-09-25"
 *                         start_time:
 *                           type: string
 *                           example: "20:53"
 *                         end_time:
 *                           type: string
 *                           example: "21:52"
 *                         description:
 *                           type: string
 *                           example: "Adipiscor comminor arx cibo arto combibo verto deputo atque demo."
 *                         service:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "Gorgeous Wooden Table"
 *                             price:
 *                               type: number
 *                               example: "10.66"
 *                         first_visit:
 *                           type: boolean
 *                           example: false
 *                         visit_type:
 *                           type: string
 *                           example: "prywatna"
 *                         status:
 *                           type: string
 *                           example: "active"
 *                         doctor:
 *                           type: object
 *                           properties:
 *                             first_name:
 *                               type: string
 *                               example: "Helmer"
 *                             last_name:
 *                               type: string
 *                               example: "MacGyver"
 *                             photo:
 *                               type: string
 *                               example: "https://avatars.githubusercontent.com/u/80491811"
 */
router.get("/patients/appointments", isAuthenticated, hasRole("patient"), validateRequest, AppointmentController.getAppointmentsByPatient);

module.exports = router;