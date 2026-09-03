const db = require("../models");
const AppError = require("../utils/appError");

const DoctorServiceService = {
    checkDoctorService: async (doctorId, serviceId) => {
        const doctorService = await db.DoctorService.findOne({
            where: { doctor_id: doctorId, service_id: serviceId },
            include: [{ model: db.Services, as: "service", attributes: ["clinic_id"] }],
        });

        if (!doctorService || !doctorService.service.clinic_id) {
            throw new AppError("The Doctor doesn't have this service", 404);
        }

        return doctorService;
    },
}

module.exports = DoctorServiceService;