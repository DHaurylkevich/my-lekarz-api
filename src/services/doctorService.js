const sequelize = require("../config/db");
const AppError = require("../utils/appError");
const db = require("../models");
const ClinicService = require("./clinicService");
const { Op } = require("sequelize");
const createJWT = require("../utils/createJWT");
const UserService = require("./userService");
const { setPasswordMail } = require("../utils/mail");
const { getPaginationParams, getTotalPages } = require("../utils/pagination");

const DoctorService = {
    createDoctor: async ({ clinicId, userData, addressData, doctorData, specialtyId, servicesIds }) => {
        const t = await sequelize.transaction();

        try {
            await ClinicService.getClinicById(clinicId);

            const foundUser = await db.Users.findOne({
                where: {
                    [Op.or]: [
                        userData.email && { email: userData.email },
                        userData.phone && { phone: userData.phone },
                        userData.pesel && { pesel: userData.pesel },
                    ].filter(Boolean)
                }
            });

            if (foundUser) {
                throw new AppError("User already exist", 400);
            }

            const createdUser = await db.Users.create(
                {
                    ...userData,
                    role: "doctor",
                    address: addressData
                },
                {
                    include: [{ model: db.Addresses, as: 'address' }],
                    transaction: t
                }
            );

            const createdDoctor = await createdUser.createDoctor(
                {
                    clinic_id: clinicId,
                    ...doctorData,
                    specialty_id: specialtyId
                },
                { transaction: t }
            );

            const resetToken = createJWT(createdUser.id, createdUser.role);
            await createdUser.update({ resetToken }, { transaction: t });

            createdDoctor.specialties_id = specialtyId;
            if (servicesIds && servicesIds.length) {
                await createdDoctor.setServices(servicesIds, { transaction: t });
            }

            await t.commit();
            await setPasswordMail(createdUser.email, resetToken);
            return;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    getDoctorById: async (doctorId) => {
        const doctor = await db.Doctors.findOne({
            where: { id: doctorId },
            attributes: ["id", "description", "rating", "hired_at"],
            include: [
                {
                    model: db.Users,
                    as: "user",
                    attributes: ["first_name", "last_name", "gender", "photo", "email", "phone"],
                    include: [
                        {
                            model: db.Addresses,
                            as: "address",
                            attributes: { exclude: ["createdAt", "updatedAt", "id", "user_id", "clinic_id"] }
                        }
                    ],
                },
                {
                    model: db.Specialties,
                    as: 'specialty',
                    attributes: ["id", "name"],
                },
                {
                    model: db.Services,
                    through: { attributes: [] },
                    as: "services",
                    attributes: ["id", "name", "price"]
                },
                {
                    model: db.Clinics,
                    as: 'clinic',
                    attributes: ["name"]
                }
            ]
        });
        if (!doctor) {
            throw new AppError("Doctor not found", 404);
        }

        return doctor;
    },
    getAllDoctorsForAdmin: async ({ sort, gender, limit, page }) => {
        const userWhere = gender ? { gender } : {};

        const sortOptions = [
            [{ model: db.Users, as: "user" }, "first_name", sort === "asc" ? "ASC" : "DESC"],
        ];

        const { parsedLimit, offset } = getPaginationParams(limit, page);

        const { rows, count } = await db.Doctors.findAndCountAll({
            limit: parsedLimit,
            offset: offset,
            attributes: ["id"],
            include: [
                {
                    model: db.Users,
                    as: "user",
                    where: userWhere,
                    attributes: ["first_name", "last_name", "gender", "createdAt", "birthday"]
                },
                {
                    model: db.Clinics,
                    as: "clinic",
                    attributes: ["name"]
                },
            ],
            order: sortOptions
        });

        const totalPages = getTotalPages(count, parsedLimit, page);

        return { pages: totalPages, doctors: rows };
    },
    updateDoctorById: async ({ doctorId, userData, addressData, doctorData, servicesIds, clinicId }) => {
        if ("password" in userData) {
            delete userData.password;
        }

        const doctor = await db.Doctors.findOne({
            where: {
                id: doctorId,
                clinic_id: clinicId
            }
        })
        if (!doctor) {
            throw new AppError("Doctor not found", 404);
        }

        const t = await sequelize.transaction();
        try {
            if ("password" in userData) {
                delete userData.password;
            }

            const user = await doctor.getUser();
            await user.update(userData, { transaction: t });

            const address = await user.getAddress();
            await address.update(addressData, { transaction: t });

            await doctor.update(doctorData, { transaction: t });
            await doctor.setServices(servicesIds, { transaction: t });

            await t.commit();
            return;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    getShortDoctorById: async (doctorId) => {
        const doctor = await db.Doctors.findByPk(doctorId, {
            attributes: ["id", "description", "rating"],
            include: [
                {
                    model: db.Users, as: "user",
                    attributes: ["first_name", "last_name", "photo"],
                },
                {
                    model: db.Specialties, as: 'specialty',
                    attributes: ["name"]
                },
                {
                    model: db.Clinics, as: 'clinic',
                    attributes: [],
                    include: [
                        { model: db.Addresses, as: "address" }
                    ]
                }
            ]
        });
        if (!doctor) {
            throw new AppError("Doctor not found", 404);
        }

        return doctor;
    },
    getDoctorsByClinicWithSorting: async ({ clinicId, gender, sort, ratingSort, limit, page, specialtyId }) => {
        const { parsedLimit, offset } = getPaginationParams(limit, page);

        const userWhere = gender ? { gender } : {};
        const specialtyWhere = specialtyId ? { id: specialtyId } : {};

        const sortOptions = []
        if (ratingSort !== '') {
            sortOptions.push(['rating', ratingSort === 'desc' ? "DESC" : "ASC"]);
        }
        sortOptions.push([{ model: db.Users, as: "user" }, "first_name", sort === "asc" ? "ASC" : "DESC"])

        const { rows, count } = await db.Doctors.findAndCountAll({
            limit: parsedLimit,
            offset: offset,
            where: { clinic_id: clinicId },
            attributes: ["id", "rating"],
            include: [
                {
                    model: db.Users,
                    as: "user",
                    where: userWhere,
                    attributes: ["first_name", "last_name", "gender", "photo"],
                },
                {
                    model: db.Specialties,
                    as: "specialty",
                    where: specialtyWhere,
                    attributes: ["name"],
                }
            ],
            order: sortOptions,
        })
        const totalPages = getTotalPages(count, parsedLimit, page);

        return { pages: totalPages, doctors: rows };
    },
    deleteDoctor: async (doctorId, clinicId) => {
        const doctor = await db.Doctors.findOne({ where: { id: doctorId, clinic_id: clinicId } });

        if (!doctor) {
            throw new AppError("Doctor not found", 404);
        }

        await UserService.deleteUserById(doctor.user_id);
    }
};

module.exports = DoctorService;