const db = require("../models");
const AppError = require("../utils/appError");

const MedicationService = {
    createMedication: async (name) => {
        let medication = await db.Medications.findOne({
            where: {
                name: name,
            }
        })
        if (medication) {
            throw new AppError("Mediation exists", 400);
        }

        medication = await db.Medications.create({ name: name });
        return { id: medication.id, name: medication.name };
    },
    getAllMedications: async () => {
        return await db.Medications.findAll({ attributes: ["id", "name"] });
    },
    getMedicationById: async (medicationId) => {
        const medication = await db.Medications.findByPk(medicationId, { attributes: ["id", "name"] });
        if (!medication) {
            throw new AppError("Medication not found", 404);
        }
        return medication;
    },
    updateMedication: async (medicationId, medicationData) => {
        let medication = await db.Medications.findByPk(medicationId);
        if (!medication) {
            throw new AppError("Medication not found", 404);
        }

        medication = await medication.update(medicationData);
        return { name: medication.name }
    },
    deleteMedication: async (medicationId) => {
        const medication = await db.Medications.findByPk(medicationId);
        if (!medication) {
            throw new AppError("Medication not found", 404);
        }

        await medication.destroy();
    }
};

module.exports = MedicationService;