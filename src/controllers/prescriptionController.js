const prescriptionService = require("../services/prescriptionService");

const prescriptionController = {
    createPrescription: async (req, res, next) => {
        try {
            const { patientId, medicationsIds, expirationDate } = req.body;
            const doctorId = req.user.roleId;

            await prescriptionService.createPrescription(patientId, doctorId, medicationsIds, expirationDate);
            return res.status(201).json({ message: "Prescription created successfully" });
        } catch (err) {
            next(err);
        }
    },
    getPrescriptions: async (req, res, next) => {
        try {
            const user = req.user;
            const { sort = 'asc' } = req.query;

            const prescriptions = await prescriptionService.getPrescriptionsByPatient(user.role, { roleId: user.roleId, sort });
            return res.status(200).json(prescriptions);
        } catch (err) {
            next(err);
        }
    },
};

module.exports = prescriptionController;
