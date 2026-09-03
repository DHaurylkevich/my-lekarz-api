const DocumentService = require("../services/documentService");

const DocumentController = {
    addDocument: async (req, res, next) => {
        const doctorId = req.user.roleId;
        const { patientId } = req.params;

        if (req.file) {
            const file = req.file.path;
            const fileName = req.file.originalname;

            try {
                await DocumentService.uploadDocument(doctorId, patientId, file, fileName);

                res.status(201).json({ message: "Document uploaded successfully" });
            } catch (err) {
                next(err);
            }
        } else {
            res.status(400).json({ message: "Please provide a file in the request" });
        }
    },
    getDocumentsForDoctors: async (req, res, next) => {
        const doctorId = req.user.roleId;
        const { patientId } = req.params;
        const { limit, page } = req.query;

        try {
            const documents = await DocumentService.getDocumentsForDoctors(doctorId, patientId, limit, page);
            res.status(200).json(documents);
        } catch (err) {
            next(err);
        }
    },
    getDocumentsForPatient: async (req, res, next) => {
        const patientId = req.user.roleId;
        const { limit, page } = req.query;

        try {
            const documents = await DocumentService.getDocumentsForPatient(patientId, limit, page);
            res.status(200).json(documents);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = DocumentController;