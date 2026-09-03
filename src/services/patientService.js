const sequelize = require("../config/db");
const db = require("../models");
const AppError = require("../utils/appError");
const { getPaginationParams, getTotalPages } = require("../utils/pagination");
const { createUser } = require("../services/userService");

const PatientService = {
    createPatient: async (userData) => {
        const t = await sequelize.transaction();

        try {
            const filter = {};
            if (userData.email) {
                filter.email = userData.email;
            } else {
                throw new AppError("Need to enter the email", 400);
            }

            userData.role = "patient";
            const createdUser = await createUser(userData, t);

            await createdUser.createPatient({}, { transaction: t });

            await t.commit();

            return createdUser;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    getPatientById: async (patientId, user) => {
        const doctorServiceWhere = user.role === "doctor" ? { doctor_id: user.roleId } : {}

        const patient = await db.Appointments.findOne({
            attributes: [],
            include: [
                {
                    model: db.Patients,
                    as: "patient",
                    where: { id: patientId },
                    attributes: ["id"],
                    include: [
                        {
                            model: db.Users,
                            as: "user",
                            attributes: ["first_name", "last_name", "photo", "phone", "email", "birthday", "gender"],
                            include: [
                                {
                                    model: db.Addresses,
                                    as: "address",
                                    attributes: ["city", "home", "street", "flat"],
                                }
                            ],
                        }
                    ]
                },
                {
                    model: db.DoctorService,
                    as: "doctorService",
                    where: doctorServiceWhere,
                    attributes: [],
                }
            ]
        });

        if (!patient) {
            throw new AppError("Patient not found", 404);
        }
        return patient;
    },
    getPatientsByParam: async ({ sort, limit, page, user }) => {
        let clinicId, doctorId;
        if (user.role === "doctor") {
            doctorId = user.roleId;
            clinicId = null;
        } else if (user.role === "clinic") {
            clinicId = user.id;
        }

        if (!doctorId && !clinicId) {
            throw new AppError("Either doctorId or clinicId is required", 400);
        }

        const sortOptions = [{ model: db.Patients, as: "patient" }, { model: db.Users, as: "user" }, "first_name", sort === "asc" ? "ASC" : "DESC"];
        const appointmentWhere = clinicId ? { clinic_id: clinicId } : {};
        const doctorServiceWhere = doctorId ? { doctor_id: doctorId } : {};

        const { parsedLimit, offset } = getPaginationParams(limit, page);

        const { rows, count } = await db.Appointments.findAndCountAll({
            limit: parsedLimit,
            offset: offset,
            where: appointmentWhere,
            attributes: ["id"],
            order: [sortOptions],
            include: [
                {
                    model: db.Patients,
                    as: "patient",
                    attributes: ["id"],
                    include: [
                        {
                            model: db.Users,
                            as: "user",
                            attributes: ["first_name", "last_name", "photo", "gender", "phone"],
                            order: [["first_name", sort === "ASC" ? "ASC" : "DESC"]],
                            include: [
                                {
                                    model: db.Addresses,
                                    as: "address",
                                    attributes: ["city", "home", "street", "flat", "post_index"],
                                }
                            ],
                        }
                    ]
                },
                {
                    model: db.DoctorService,
                    as: "doctorService",
                    where: doctorServiceWhere,
                    attributes: [],
                }
            ]
        });

        const totalPages = getTotalPages(count, parsedLimit, page);

        return { pages: totalPages, patients: rows };
    },
    getAllPatientsForAdmin: async ({ sort, gender, limit, page }) => {
        const userWhere = gender ? { gender } : {};

        const sortOptions = [
            [{ model: db.Users, as: "user" }, "first_name", sort === "asc" ? "ASC" : "DESC"],
        ];

        const { parsedLimit, offset } = getPaginationParams(limit, page);

        const { rows, count } = await db.Patients.findAndCountAll({
            limit: parsedLimit,
            offset: offset,
            attributes: [],
            order: sortOptions,
            include: [
                {
                    model: db.Users,
                    as: "user",
                    where: userWhere,
                    attributes: ["first_name", "last_name", "gender", "createdAt", "birthday"]
                },
            ],
        });

        const totalPages = getTotalPages(count, parsedLimit, page);

        if (!rows.length) {
            return { pages: 0, patients: [] };
        }

        return { pages: totalPages, patients: rows };
    }
};

module.exports = PatientService;