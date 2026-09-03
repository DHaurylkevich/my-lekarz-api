const AppointmentService = require("../services/appointmentService");

const AppointmentController = {
    createAppointment: async (req, res, next) => {
        const patientId = req.user.roleId;
        const { doctorId, serviceId, date, timeSlot, firstVisit, visitType, description } = req.body;

        try {
            const appointment = await AppointmentService.createAppointment({ doctorId, serviceId, patientId, date, timeSlot, firstVisit, visitType, description });
            res.status(201).json(appointment);
        } catch (err) {
            next(err);
        }
    },
    getAppointmentsByClinic: async (req, res, next) => {
        const clinicId = req.user.id;
        const { doctorId, active, patientId, date, specialty, limit, page } = req.query;

        try {
            const appointments = await AppointmentService.getAppointmentsByClinic({ clinicId, active, doctorId, patientId, date, specialty, limit, page });
            res.status(200).json(appointments);
        } catch (err) {
            next(err);
        }
    },
    getAppointmentsByPatientId: async (req, res, next) => {
        const { patientId } = req.params;
        const { limit, page } = req.query;

        try {
            const appointments = await AppointmentService.getAppointmentsByPatientId(patientId, limit, page);
            res.status(200).json(appointments);
        } catch (err) {
            next(err);
        }
    },
    getAppointmentsByDoctor: async (req, res, next) => {
        const doctorId = req.user.roleId;
        const { startDate, endDate, status, limit, page } = req.query;

        try {
            const appointments = await AppointmentService.getAllAppointmentsByDoctor({ doctorId, limit, page, startDate, endDate, status });
            res.status(200).json(appointments);
        } catch (err) {
            next(err);
        }
    },
    getAppointmentsByPatient: async (req, res, next) => {
        const patientId = req.user.roleId;
        const { limit, page, startDate, endDate } = req.query;

        try {
            const appointments = await AppointmentService.getAllAppointmentsByPatient({ patientId, limit, page, startDate, endDate });
            res.status(200).json(appointments);
        } catch (err) {
            next(err);
        }
    },
    deleteAppointment: async (req, res, next) => {
        const { appointmentId } = req.params;
        const patientId = req.user.roleId;

        try {
            await AppointmentService.deleteAppointment(appointmentId, patientId);
            res.status(200).json({ message: "Appointment deleted successfully" });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = AppointmentController;