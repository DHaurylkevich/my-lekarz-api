const ServiceService = require("../services/serviceService");

const ServiceController = {
    createService: async (req, res, next) => {
        const clinicId = req.user.id;
        const { name, specialtyId, price } = req.body;

        try {
            const service = await ServiceService.createService({ clinicId, name, specialtyId, price });
            res.status(201).json(service);
        } catch (err) {
            next(err);
        }
    },
    getServiceById: async (req, res, next) => {
        const { serviceId } = req.params;

        try {
            const service = await ServiceService.getServiceById(serviceId);
            res.status(200).json(service)
        } catch (err) {
            next(err);
        }
    },
    getServicesByDoctor: async (req, res, next) => {
        const { doctorId } = req.params;

        try {
            const services = await ServiceService.getAllServicesByDoctorId(doctorId);
            res.status(200).json(services)
        } catch (err) {
            next(err);
        }
    },
    getServicesByClinic: async (req, res, next) => {
        const { clinicId } = req.params;

        try {
            const service = await ServiceService.getAllServicesByClinicId(clinicId);
            res.status(200).json(service)
        } catch (err) {
            next(err);
        }
    },
    updateService: async (req, res, next) => {
        const clinicId = req.user.id;
        const { serviceId } = req.params;
        const serviceData = req.body;

        try {
            await ServiceService.updateService(clinicId, serviceId, serviceData);

            res.status(200).json({ message: "Service updated successfully" });
        } catch (err) {
            next(err);
        }
    },
    deleteService: async (req, res, next) => {
        const clinicId = req.user.id;
        const { serviceId } = req.params;

        try {
            await ServiceService.deleteService(clinicId, serviceId);
            res.status(200).json({ message: "Service deleted successfully" });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = ServiceController;