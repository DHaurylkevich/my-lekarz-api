const MedicationService = require("../services/medicationService");

const MedicationController = {
    createMedication: async (req, res, next) => {
        const { name } = req.body;

        try {
            const medication = await MedicationService.createMedication(name);
            res.status(201).json(medication);
        } catch (err) {
            next(err);
        }
    },
    getMedicationById: async (req, res, next) => {
        const { medicationId } = req.params;

        try {
            const medication = await MedicationService.getMedicationById(medicationId);
            res.status(200).json(medication);
        } catch (err) {
            next(err);
        }
    },
    getAllMedications: async (req, res, next) => {
        try {
            const medications = await MedicationService.getAllMedications();
            res.status(200).json(medications);
        } catch (err) {
            next(err);
        }
    },
    updateMedication: async (req, res, next) => {
        const { medicationId } = req.params;
        const medicationData = req.body;

        try {
            const medication = await MedicationService.updateMedication(medicationId, medicationData);
            res.status(200).json(medication);
        } catch (err) {
            next(err);
        }
    },
    deleteMedication: async (req, res, next) => {
        const { medicationId } = req.params;

        try {
            await MedicationService.deleteMedication(medicationId);
            res.status(200).json({ message: "Medication deleted successfully" });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = MedicationController;
