const db = require("../models");
const AppError = require("../utils/appError");

const SpecialtyService = {
    createSpecialty: async (specialtyData) => {
        const specialtyExist = await db.Specialties.findOne({ where: { name: specialtyData.name } });
        if (specialtyExist) {
            throw new AppError("Specialty already exists", 409);
        }

        const specialty = await db.Specialties.create(specialtyData);
        return { id: specialty.id, name: specialty.name }

    },
    getAllSpecialties: async () => {
        return await db.Specialties.findAll({ attributes: ["id", "name"] });
    },
    getAllSpecialtiesByClinic: async (clinicId) => {
        const specialties = await db.Specialties.findAll({
            attributes: ["id", "name"],
            include: [
                {
                    model: db.Services, as: "services",
                    attributes: ["id", "name", "price"],
                    where: { clinic_id: clinicId },
                }
            ]
        });

        return specialties;
    },
    getAllSpecialtiesByClinicWithDoctor: async (clinicId) => {
        const specialties = await db.Specialties.findAll({
            attributes: ["id", "name"],
            include: [
                {
                    model: db.Doctors, as: "doctors",
                    where: { clinic_id: clinicId },
                    attributes: ["id"],
                    include: [{
                        model: db.Users,
                        as: "user",
                        attributes: ["first_name", "last_name"],
                    }]
                }
            ]
        });

        return specialties;
    },
    getSpecialtyById: async (specialtyId) => {
        const specialty = await db.Specialties.findByPk(specialtyId);
        if (!specialty) {
            throw new AppError("Specialty not found", 404);
        }

        return { id: specialty.id, name: specialty.name };
    },
    updateSpecialty: async (specialtyId, data) => {
        const specialty = await db.Specialties.findByPk(specialtyId);
        if (!specialty) {
            throw new AppError("Specialty not found", 404);
        }

        await specialty.update(data);
    },
    deleteSpecialty: async (specialtyId) => {
        const specialty = await db.Specialties.findByPk(specialtyId);
        if (!specialty) {
            throw new AppError("Specialty not found", 404);
        }

        await specialty.destroy();
    }
};

module.exports = SpecialtyService;