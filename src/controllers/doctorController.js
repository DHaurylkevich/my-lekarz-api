const DoctorService = require("../services/doctorService");

const DoctorController = {
    createDoctor: async (req, res, next) => {
        const clinicId = req.user.id;
        const { userData, addressData, doctorData, specialtyId, servicesIds } = req.body;

        try {
            await DoctorService.createDoctor({ userData, addressData, doctorData, specialtyId, clinicId, servicesIds });

            res.status(201).json({ message: "The link for password configuration has been sent to mail" });
        } catch (err) {
            next(err);
        }
    },
    getDoctorById: async (req, res, next) => {
        const { doctorId } = req.params;

        try {
            const doctor = await DoctorService.getDoctorById(doctorId);
            res.status(200).json(doctor);
        } catch (err) {
            next(err);
        }
    },
    deleteDoctor: async (req, res, next) => {
        const clinicId = req.user.id;
        const { doctorId } = req.params;

        try {
            await DoctorService.deleteDoctor(doctorId, clinicId);
            res.status(200).json({ message: "Doctor deleted successfully" })
        } catch (err) {
            next(err)
        }
    },
    getAllDoctorsForAdmin: async (req, res, next) => {
        const { sort = "asc", gender, limit, page } = req.query;

        try {
            const doctors = await DoctorService.getAllDoctorsForAdmin({ sort, gender, limit, page });
            res.status(200).json(doctors);
        } catch (err) {
            next(err);
        }
    },
    updateDoctorById: async (req, res, next) => {
        const { doctorId } = req.params;
        const { userData, addressData, doctorData, servicesIds } = req.body;
        const clinicId = req.user.id;

        try {
            await DoctorService.updateDoctorById({ doctorId, userData, addressData, doctorData, servicesIds, clinicId });

            res.status(200).json({ message: "Doctor update successfully" });
        } catch (err) {
            next(err);
        }
    },
    getShortDoctorById: async (req, res, next) => {
        const { doctorId } = req.params;

        try {
            const createdDoctor = await DoctorService.getShortDoctorById(doctorId);
            res.status(200).json(createdDoctor);
        } catch (err) {
            next(err);
        }
    },
    getDoctorsByClinicWithSorting: async (req, res, next) => {
        const { clinicId } = req.params;
        const { gender, sort = "asc", ratingSort = "", limit, page, specialtyId } = req.query;

        try {
            const doctors = await DoctorService.getDoctorsByClinicWithSorting({ clinicId, gender, sort, ratingSort, limit, page, specialtyId });
            res.status(200).json(doctors);
        } catch (err) {
            next(err);
        }
    },
}

module.exports = DoctorController;