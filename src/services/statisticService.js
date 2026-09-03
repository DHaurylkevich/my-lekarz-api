const db = require("../models");
const sequelize = require("../config/db");
const moment = require("moment");
const { Op } = require("sequelize");

const calculatePercentage = (total, beforeToday) => {
    if (beforeToday === 0) return total === 0 ? 0 : 100;
    return ((total - beforeToday) / beforeToday) * 100;
};

const StatisticsService = {
    countPatients: async (user) => {
        let appointmentWhere = {};

        if (user.role === "doctor") {
            appointmentWhere = {
                model: db.DoctorService,
                as: 'doctorService',
                required: true,
                distinct: true,
                where: { doctor_id: user.roleId },
            };
        }

        const today = moment().startOf('day').toDate();
        const startOfMonth = moment().startOf('month').toDate();
        const endOfMonth = moment().endOf('month').toDate();

        const [countBeforeToday, totalCount] = await Promise.all([
            db.Patients.count({
                raw: true,
                distinct: true,
                include: [
                    {
                        model: db.Appointments,
                        as: "appointments",
                        attributes: [],
                        required: true,
                        where: { ...(user.role === "clinic" && { clinic_id: user.id }) },
                        include: appointmentWhere ? [] : [
                            appointmentWhere,
                            {
                                model: db.Schedules, required: true, attributes: ["date"], where: {
                                    date: {
                                        [Op.between]: [startOfMonth, endOfMonth],
                                        [Op.lt]: today
                                    }
                                }
                            }
                        ]
                    }
                ]
            }),
            db.Patients.count({
                raw: true,
                attributes: [],
                distinct: true,
                include: [
                    {
                        model: db.Appointments,
                        as: "appointments",
                        attributes: [],
                        required: true,
                        where: { ...(user.role === "clinic" && { clinic_id: user.id }) },
                        include: appointmentWhere ? [] : [
                            {
                                model: db.Schedules, required: true, attributes: ["date"], where: {
                                    date: {
                                        [Op.between]: [startOfMonth, endOfMonth],
                                    }
                                }
                            }
                        ]
                    }
                ]
            })
        ]);

        const percentageChange = calculatePercentage(totalCount, countBeforeToday);

        return { percentageChange, totalCount };
    },
    averageScore: async (clinicId) => {
        const today = moment().startOf('day').toDate();

        const [beforeToday, currentRating] = await Promise.all([
            db.Clinics.findOne({
                raw: true,
                where: { id: clinicId },
                attributes: [
                    [
                        sequelize.literal(`(
                                SELECT COALESCE(ROUND(AVG(d.rating)::numeric, 1), 0)
                                FROM doctors d
                                WHERE d.clinic_id = ${clinicId} AND d."updatedAt" < '${today.toISOString()}'
                            )`),
                        'averageRating'
                    ]
                ]
            }),
            db.Clinics.findOne({
                raw: true,
                where: { id: clinicId },
                attributes: [
                    [
                        sequelize.literal(`(
                                SELECT COALESCE(ROUND(AVG(d.rating)::numeric, 1), 0)
                                FROM doctors d
                                WHERE d.clinic_id = ${clinicId}
                            )`),
                        'averageRating'
                    ]
                ]
            })
        ]);

        const percentageChange = calculatePercentage(currentRating.averageRating, beforeToday.averageRating);

        return { percentageChange, currentRating: currentRating.averageRating };
    },
    countAppointments: async (doctorId, startOfMonth, endOfMonth) => {
        const today = moment().startOf('day').toDate();

        if (!endOfMonth && !startOfMonth) {
            startOfMonth = moment().startOf('month').toDate();
            endOfMonth = moment().endOf('month').toDate();
        }

        const [countBeforeToday, totalCount, totalCountToday] = await Promise.all([
            db.Appointments.count({
                raw: true,
                attributes: [],
                where: { status: "active" },
                include: [
                    { model: db.DoctorService, as: 'doctorService', where: { doctor_id: doctorId }, },
                    {
                        model: db.Schedules, required: true, attributes: ["date"], where: {
                            date: {
                                [Op.between]: [startOfMonth, endOfMonth],
                                [Op.lt]: today
                            }
                        }
                    }
                ]
            }),
            db.Appointments.count({
                raw: true,
                attributes: [],
                where: { status: "active" },
                include: [
                    { model: db.DoctorService, as: 'doctorService', where: { doctor_id: doctorId } },
                    {
                        model: db.Schedules, required: true, attributes: ["date"], where: {
                            date: { [Op.between]: [startOfMonth, endOfMonth] }
                        }
                    },
                ]
            }),
            db.Appointments.count({
                raw: true,
                attributes: [],
                where: { status: "active" },
                include: [
                    { model: db.DoctorService, as: 'doctorService', where: { doctor_id: doctorId } },
                    { model: db.Schedules, attributes: ["date"], where: { date: today } }
                ]
            })
        ]);

        const percentageChange = calculatePercentage(totalCount, countBeforeToday);

        return { percentageChange, totalCount, totalCountToday };
    },
    mainStatist: async (start_date, end_date) => {
        const today = start_date ? start_date : moment().startOf('day').toDate();
        const datesWhere = start_date && end_date ? { createdAt: { [Op.between]: [start_date, end_date] } } : {}

        const [
            beforeTodayPatient,
            totalPatient,
            beforeTodayClinic,
            totalClinic,
            beforeTodayDoctor,
            totalDoctor,
            beforeTodayAppointment,
            totalAppointment
        ] = await Promise.all([
            db.Patients.count({
                raw: true,
                attributes: [],
                where: { createdAt: { [Op.lt]: today } }
            }),
            db.Patients.count({ raw: true, attributes: [], where: datesWhere }),
            db.Clinics.count({
                raw: true,
                attributes: [],
                where: { createdAt: { [Op.lt]: today } }

            }),
            db.Clinics.count({ raw: true, attributes: [], where: datesWhere }),
            db.Doctors.count({
                raw: true,
                attributes: [],
                where: { createdAt: { [Op.lt]: today } }

            }),
            db.Doctors.count({ raw: true, attributes: [], where: datesWhere }),
            db.Appointments.count({
                raw: true,
                attributes: [],
                where: { createdAt: { [Op.lt]: today } }
            }),
            db.Appointments.count({ raw: true, attributes: [], where: datesWhere }),
        ]);

        const percentagePatient = calculatePercentage(totalPatient, beforeTodayPatient);
        const percentageClinics = calculatePercentage(totalClinic, beforeTodayClinic);
        const percentageDoctors = calculatePercentage(totalDoctor, beforeTodayDoctor);
        const percentageAppointments = calculatePercentage(totalAppointment, beforeTodayAppointment);

        return { totalPatient, percentagePatient, totalClinic, percentageClinics, totalDoctor, percentageDoctors, totalAppointment, percentageAppointments };
    },
    countNewPatientsAndClinics: async () => {
        const oneYearAgo = moment().subtract(1, 'years').toDate();

        const [newPatients, allPatients, newClinics, allClinics] = await Promise.all([
            db.Patients.findAll({
                limit: 4,
                order: [['createdAt', 'DESC']],
                attributes: ['createdAt', "id"],
                include: [
                    {
                        model: db.Users,
                        as: 'user',
                        attributes: ["first_name", "last_name",]
                    }
                ]
            }),
            db.Patients.findAll({
                order: [['createdAt', 'DESC']],
                attributes: ['createdAt'],
                where: { createdAt: { [Op.gte]: oneYearAgo } }
            }),
            db.Clinics.findAll({
                limit: 4,
                order: [['createdAt', 'DESC']],
                attributes: ['createdAt', "name"],
            }),
            db.Clinics.findAll({
                order: [['createdAt', 'DESC']],
                attributes: ['createdAt'],
                where: { createdAt: { [Op.gte]: oneYearAgo } }
            })
        ]);

        return { newPatients, allPatients, newClinics, allClinics };
    },
    ratingsStatistics: async (start_date, end_date) => {
        const datesWhere = start_date && end_date ? { createdAt: { [Op.between]: [start_date, end_date] } } : {}

        const [doctorRatings, cityRating, clinicsFeedback, patientsFeedback] = await Promise.all([
            db.Doctors.findAll({
                raw: true,
                limit: 5,
                attributes: ['rating'],
                where: datesWhere,
                group: ['rating'],
                order: [['rating', 'DESC']],
            }),
            db.Clinics.findAll({
                raw: true,
                attributes: [
                    [sequelize.col('address.city'), 'city'],
                    [sequelize.literal(`(
                            SELECT COALESCE(ROUND(CAST(AVG(d.rating) AS numeric), 1), 0)
                            FROM doctors d
                            WHERE d.clinic_id = "Clinics".id
                        )`), 'averageRating']
                ],
                where: datesWhere,
                include: [
                    {
                        model: db.Addresses,
                        required: true,
                        as: 'address',
                        attributes: ["city"]
                    }
                ],
                group: ['address.city', 'Clinics.id'],
                order: [[sequelize.literal('"averageRating"'), 'DESC']],
                limit: 5,
            }),
            db.Clinics.findAll({
                raw: true,
                attributes: [
                    "feedbackRating",
                    [sequelize.fn('COUNT', sequelize.col('feedbackRating')), 'count']
                ],
                where: { feedbackRating: { [Op.ne]: null } },
                group: ['feedbackRating'],
            }),
            db.Patients.findAll({
                raw: true,
                attributes: [
                    "feedbackRating",
                    [sequelize.fn('COUNT', sequelize.col('feedbackRating')), 'count']
                ],
                where: { feedbackRating: { [Op.ne]: null } },
                group: ['feedbackRating'],
            })
        ]);

        return { doctorRatings, cityRating, clinicsFeedback, patientsFeedback };
    },
    mainPageStatistics: async () => {
        const [provinces, countCity, countDoctor, countSpecialties] = await Promise.all([
            db.Addresses.findAll({
                attributes: [
                    [sequelize.col('province'), 'province'],
                    [sequelize.fn('COUNT', sequelize.col('clinic.id')), 'clinicCount']
                ],
                include: [
                    {
                        model: db.Clinics,
                        required: true,
                        as: 'clinic',
                        attributes: []
                    }
                ],
                group: ['Addresses.province'],
                order: [[sequelize.fn('COUNT', sequelize.col('clinic.id')), 'DESC']],
                raw: true
            }),
            db.Addresses.count({
                distinct: true,
                col: 'city'
            }),
            db.Doctors.count(),
            db.Specialties.count(),
        ]);
        return { provinces, countCity, countDoctor, countSpecialties };
    }
};

module.exports = StatisticsService;