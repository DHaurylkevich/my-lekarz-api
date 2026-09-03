const cloudinary = require("../middleware/upload");
const AppError = require("../utils/appError");
const db = require("../models");
const { getPaginationParams, getTotalPages } = require("../utils/pagination");

const DoctorService = {
    uploadDocument: async (doctorId, patientId, file, fileName) => {
        try {
            let patient = await db.Patients.findByPk(patientId);
            if (!patient) {
                throw new AppError("Patient not found", 404);
            }

            await db.Documents.create({ name: fileName, link: file, patient_id: patientId, doctor_id: doctorId });
        } catch (err) {
            if (file) await cloudinary.deleteFromCloud(file);
            throw err;
        }
    },
    getDocumentsForDoctors: async (doctorId, patientId, limit, page) => {
        const { parsedLimit, offset } = getPaginationParams(limit, page);

        const { rows, count } = await db.Documents.findAndCountAll({
            limit: parsedLimit,
            offset: offset,
            attributes: ["name", "link"],
            where: {
                doctor_id: doctorId,
                patient_id: patientId
            },
            order: [["createdAt", "ASC"]]
        });

        const totalPages = getTotalPages(count, parsedLimit, page);

        return { pages: totalPages, documents: rows };
    },
    getDocumentsForPatient: async (patientId, limit, page) => {
        const { parsedLimit, offset } = getPaginationParams(limit, page);

        const { rows, count } = await db.Documents.findAndCountAll({
            limit: parsedLimit,
            offset: offset,
            attributes: ["name", "link"],
            where: { patient_id: patientId },
            order: [["createdAt", "ASC"]]
        });

        const totalPages = getTotalPages(count, parsedLimit, page);

        return { pages: totalPages, documents: rows };
    },
};

module.exports = DoctorService;