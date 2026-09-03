const { Op } = require("sequelize");
const db = require("../models");
const sequelize = require("../config/db");
const { getPaginationParams } = require("../utils/pagination");

function getQueryWords(query) {
    const words = query.split(" ");
    return words.map(word => "%" + word + "%");
}

const SearchService = {
    searchPosts: async (query, page, limit) => {
        const { parsedLimit, offset } = getPaginationParams(limit, page);
        const queryWhere = getQueryWords(query);

        const { rows, count } = await db.Posts.findAndCountAll({
            offset,
            limit: parsedLimit,
            attributes: { exclude: ["updatedAt", "id", "category_id"] },
            where: {
                [Op.or]: [
                    {
                        title: {
                            [Op.iLike]: {
                                [Op.any]: queryWhere,
                            },
                        }
                    },
                    {
                        content: {
                            [Op.iLike]: {
                                [Op.any]: queryWhere,
                            },
                        }
                    },
                    {
                        '$category.name$': {
                            [Op.iLike]: {
                                [Op.any]: queryWhere,
                            },
                        }
                    }
                ]
            },
            include: [
                {
                    model: db.Categories,
                    as: "category",
                    attributes: ["name"]
                }
            ]
        });
        const totalPages = Math.ceil(count / parsedLimit);

        return { posts: rows, pages: totalPages };
    },
    searchPatients: async (query, page, limit, user) => {
        const { parsedLimit, offset } = getPaginationParams(limit, page);
        const queryWhere = getQueryWords(query);

        let appointmentWhere = {};
        let userInclude = {};
        switch (user.role) {
            case "clinic":
                userInclude = {
                    attributes: ["first_name", "last_name", "photo", "phone"],
                };
                appointmentWhere = {
                    model: db.Appointments,
                    as: "appointments",
                    attributes: [],
                    where: { clinic_id: user.id },
                    required: true,
                };
                break;
            case "doctor":
                userInclude = {
                    attributes: ["first_name", "last_name", "photo", "phone", "pesel", "gender", "birthday", "createdAt"],
                    include: [
                        {
                            model: db.Addresses,
                            as: "address",
                            attributes: { exclude: ["createdAt", "updatedAt", "id", "user_id", "clinic_id"] },
                            required: true,
                        }
                    ]
                };
                appointmentWhere = {
                    model: db.Appointments,
                    as: "appointments",
                    attributes: [],
                    required: true,
                    where: {
                        id: {
                            [Op.in]: sequelize.literal(`(
                                SELECT "appointments"."id"
                                FROM "appointments"
                                INNER JOIN "doctor_services" AS "doctorService"
                                ON "appointments"."doctor_service_id" = "doctorService"."id"
                                WHERE "doctorService"."doctor_id" = ${user.roleId}
                            )`),
                        },
                    },
                };
                break;
            default:
                userInclude = {
                    attributes: ["first_name", "last_name", "photo", "phone", "gender", "birthday", "createdAt"],
                };
                break;
        }
        const includeArray = [
            {
                model: db.Users,
                as: "user",
                ...userInclude,
                where: {
                    [Op.or]: [
                        {
                            first_name: {
                                [Op.iLike]: { [Op.any]: queryWhere },
                            }
                        },
                        {
                            last_name: {
                                [Op.iLike]: { [Op.any]: queryWhere },
                            }
                        },
                    ],
                },
                required: true,
            },
        ];
        if (Object.keys(appointmentWhere).length > 0) {
            includeArray.push(appointmentWhere);
        }

        const { rows, count } = await db.Patients.findAndCountAll({
            include: includeArray,
            attributes: ["id"],
            offset: offset,
            limit: parsedLimit,
            distinct: true,
        });

        const totalPages = Math.ceil(count / parsedLimit);

        return { patients: rows, pages: totalPages };
    },
    searchDoctors: async (query, page, limit, user) => {
        const { parsedLimit, offset } = getPaginationParams(limit, page);
        const queryWhere = getQueryWords(query);

        let doctorWhere = {};
        let otherInclude = {};
        let userInclude = {};
        switch (user.role) {
            case "clinic":
                doctorWhere = { clinic_id: user.id };
                userInclude = {
                    attributes: ["first_name", "last_name", "gender", "photo", "email"],
                    include: [
                        {
                            model: db.Addresses,
                            as: "address",
                            attributes: { exclude: ["createdAt", "updatedAt", "id", "user_id", "clinic_id"] }
                        }
                    ]
                };
                otherInclude = {
                    model: db.Specialties,
                    as: 'specialty',
                    attributes: ["name"],
                    include: [
                        { model: db.Services, as: "services", attributes: ["name"] }
                    ]
                };
                // appointmentWhere = {
                //     model: db.Clinics,
                //     where: { id: user.id },
                //     as: "clinic",
                //     attributes: ["id"]
                // };
                break;
            case "admin":
                userInclude = {
                    attributes: ["first_name", "last_name", "gender", "createdAt", "birthday"]
                };
                otherInclude = {
                    model: db.Clinics,
                    as: "clinic",
                    attributes: ["name"]
                };
                break;
        }

        const { rows, count } = await db.Doctors.findAndCountAll({
            offset,
            limit: parsedLimit,
            attributes: ["id"],
            where: doctorWhere,
            required: true,
            include: [
                otherInclude,
                {
                    model: db.Users,
                    as: "user",
                    ...userInclude,
                    where: {
                        [Op.or]: [
                            {
                                first_name: {
                                    [Op.iLike]: { [Op.any]: queryWhere },
                                }
                            },
                            {
                                last_name: {
                                    [Op.iLike]: { [Op.any]: queryWhere },
                                }
                            },
                        ],
                    },
                }
            ]
        });

        const totalPages = Math.ceil(count / parsedLimit);

        return { doctors: rows, pages: totalPages };
    },
    searchClinic: async (query, page, limit) => {
        const { parsedLimit, offset } = getPaginationParams(limit, page);
        const queryWhere = getQueryWords(query);

        const { rows, count } = await db.Clinics.findAndCountAll({
            offset,
            limit: parsedLimit,
            attributes: { exclude: ["resetToken", "updatedAt", "role", "password"] },
            where: {
                [Op.or]: [
                    {
                        name: {
                            [Op.iLike]: { [Op.any]: queryWhere },
                        }
                    }
                ],
            },
            include: [
                {
                    model: db.Addresses,
                    as: "address",
                    attributes: ["city", "street", "home", "flat"]
                },
                {
                    model: db.Timetables,
                    as: "timetables",
                    attributes: ["day_of_week", "start_time", "end_time"]
                }
            ]
        });

        const totalPages = Math.ceil(count / parsedLimit);

        return { clinics: rows, pages: totalPages };
    },
    searchPrescription: async (query, page, limit, doctorId) => {
        const { parsedLimit, offset } = getPaginationParams(limit, page);
        const queryWhere = getQueryWords(query);

        const { rows, count } = await db.Prescriptions.findAndCountAll({
            offset,
            limit: parsedLimit,
            where: { doctor_id: doctorId },
            attributes: ["code", "expiration_date"],
            include: [
                {
                    model: db.Patients,
                    as: "patient",
                    required: true,
                    attributes: ["id"],
                    include: [
                        {
                            model: db.Users,
                            as: "user",
                            attributes: ["first_name", "last_name", "photo"],
                            where: {
                                [Op.or]: [
                                    {
                                        first_name: {
                                            [Op.iLike]: { [Op.any]: queryWhere },
                                        }
                                    },
                                    {
                                        last_name: {
                                            [Op.iLike]: { [Op.any]: queryWhere },
                                        }
                                    },
                                ],
                            },
                        }
                    ]
                },
                { model: db.Medications, as: "medications", attributes: ["name"] },
            ]
        });
        const totalPages = Math.ceil(count / parsedLimit);

        return { prescription: rows, pages: totalPages };
    },
};

module.exports = SearchService;
