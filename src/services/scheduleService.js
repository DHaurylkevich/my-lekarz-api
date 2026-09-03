const { Op } = require("sequelize");
const db = require("../models");
const AppError = require("../utils/appError");
const { getPaginationParams, getTotalPages } = require("../utils/pagination");

const ScheduleService = {
    createSchedule: async (clinicId, scheduleData) => {
        const t = await db.sequelize.transaction();

        try {
            const { doctorsIds, dates, ...commonData } = scheduleData;

            const existingDoctors = await db.Doctors.findAll({
                where: {
                    id: { [Op.in]: doctorsIds },
                    clinic_id: clinicId
                },
                attributes: ["id"],
                transaction: t
            });
            if (existingDoctors.length !== doctorsIds.length) {
                throw new AppError("One or more doctors not found", 404);
            }

            scheduleData = doctorsIds.flatMap(doctorId =>
                dates.map(date => ({
                    ...commonData,
                    date: date,
                    clinic_id: clinicId,
                    doctor_id: doctorId
                }))
            );

            const existingSchedules = await db.Schedules.findAll({
                where: {
                    [Op.or]: scheduleData
                },
                transaction: t
            });

            if (existingSchedules.length > 0) {
                throw new AppError("One or more schedules already exist", 400);
            }

            const createdSchedules = await db.Schedules.bulkCreate(scheduleData, { transaction: t });

            await t.commit();
            return createdSchedules;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    getScheduleById: async (scheduleId) => {
        const schedule = await db.Schedules.findByPk(scheduleId, {
            attributes: ["id", "interval", "start_time", "end_time", "date"],
            include: [
                {
                    model: db.Doctors,
                    as: "doctor",
                    attributes: ["id"],
                    include: [
                        {
                            model: db.Users,
                            as: "user",
                            attributes: ["first_name", "last_name", "photo"]
                        }
                    ],
                },
                {
                    model: db.Clinics,
                    as: "clinic",
                    attributes: ["name"]
                }
            ]
        });

        if (!schedule) {
            throw new AppError("Schedule not found", 404);
        }

        return schedule;
    },
    updateSchedule: async (clinicId, scheduleId, data) => {
        let schedule = await db.Schedules.findOne({ where: { clinic_id: clinicId, id: scheduleId } });

        if (!schedule) {
            throw new AppError("Schedule not found", 404);
        }

        schedule = await schedule.update(data);
        return { id: schedule.id, available_slots: schedule.available_slots, interval: schedule.interval, date: schedule.date, start_time: schedule.start_time, end_time: schedule.end_time };
    },
    deleteSchedule: async (clinicId, scheduleId) => {
        let schedule = await db.Schedules.findOne({ where: { clinic_id: clinicId, id: scheduleId } });

        if (!schedule) {
            throw new AppError("Schedule not found", 404);
        }

        await schedule.destroy();
    },
    getScheduleByDoctor: async ({ doctorId, year, month }) => {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const schedules = await db.Schedules.findAll({
            where: {
                doctor_id: doctorId,
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            attributes: { exclude: ["createdAt", "updatedAt", "clinic_id", "available_slots", "doctor_id"] },
            order: [['date', 'ASC']]
        });

        const totalHours = schedules.reduce((sum, schedule) => {
            const startTime = new Date(`1970-01-01T${schedule.start_time}Z`);
            const endTime = new Date(`1970-01-01T${schedule.end_time}Z`);

            const hours = (endTime - startTime) / (1000 * 60 * 60);
            return sum + hours;
        }, 0);

        return { totalHours, schedules };
    },
    getScheduleByClinic: async ({ clinicId, year, month }, doctorIds) => {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const whereClause = {
            clinic_id: clinicId,
            date: {
                [Op.between]: [startDate, endDate]
            }
        };

        if (doctorIds && !Array.isArray(doctorIds)) {
            doctorIds = [doctorIds];
        }

        if (doctorIds && doctorIds.length > 0) {
            whereClause.doctor_id = { [Op.in]: doctorIds };
        }

        const schedules = await db.Schedules.findAll({
            where: whereClause,
            attributes: { exclude: ["createdAt", "updatedAt", "doctor_id", "available_slots", "clinic_id"] },
            include: [
                {
                    model: db.Doctors,
                    as: "doctor",
                    attributes: ["rating", "description"],
                    include: [
                        {
                            model: db.Users,
                            as: "user",
                            attributes: ["first_name", "last_name", "photo"]
                        }
                    ]
                }
            ],
            order: [['date', 'ASC']]
        });

        const totalHours = schedules.reduce((sum, schedule) => {
            const startTime = new Date(`1970-01-01T${schedule.start_time}Z`);
            const endTime = new Date(`1970-01-01T${schedule.end_time}Z`);

            const hours = (endTime - startTime) / (1000 * 60 * 60);
            return sum + hours;
        }, 0);

        return { totalHours, schedules };
    },
    getAvailableSlotsWithFilter: async ({ city, specialty, date, limit, page }) => {
        const clinicWhere = city ? { city: { [Op.iLike]: `%${city}%` } } : {};
        const specialtyWhere = specialty ? { name: { [Op.iLike]: `%${specialty}%` } } : {};
        const scheduleWhere = {
            where: date
                ? { date: date }
                : {
                    date: { [Op.gte]: new Date() },
                    available_slots: { [Op.not]: [] }
                },
            required: true,
            order: [["date", "ASC"]]
        }

        const { parsedLimit, offset } = getPaginationParams(limit, page);

        let { rows, count } = await db.Doctors.findAndCountAll({
            limit: parsedLimit,
            offset: offset,
            attributes: ["id", "description", "rating"],
            distinct: true,
            include: [
                {
                    model: db.Schedules,
                    attributes: ["id", "date", "interval", "end_time", "start_time", "available_slots"],
                    ...scheduleWhere,
                },
                {
                    model: db.Users,
                    as: "user",
                    attributes: ["first_name", "last_name", "photo", "phone"],
                },
                {
                    model: db.Specialties,
                    as: "specialty",
                    attributes: ["name"],
                    where: specialtyWhere,
                    required: true,
                },
                {
                    model: db.Clinics,
                    as: "clinic",
                    attributes: ["id", "name"],
                    required: true,
                    include: [
                        {
                            model: db.Addresses,
                            as: "address",
                            where: clinicWhere,
                            attributes: ["id", "city", "street", "home", "flat", "post_index"],
                            required: true,
                        }
                    ]
                },
                {
                    model: db.Services,
                    as: "services",
                    attributes: ["id", "name", "price"],
                    through: { attributes: [] },
                }
            ]
        });

        const totalPages = getTotalPages(count, parsedLimit, page);

        const availableSlots = rows.map(doctor => {
            const freeSlots = doctor.Schedules
                .slice(0, 2)
                .map(schedule => ({
                    date: schedule.date, slots: schedule.available_slots
                }));

            return {
                doctor_id: doctor.id,
                description: doctor.description,
                rating: doctor.rating,
                user: doctor.user,
                specialty: doctor.specialty.name,
                clinic: doctor.clinic,
                service: doctor.services,
                available_slots: freeSlots,
            };
        });

        return { totalCount: count, pages: totalPages, slots: availableSlots };
    },
    checkScheduleAndSlot: async (doctorId, date, timeSlot) => {
        const schedule = await db.Schedules.findOne({
            where: { doctor_id: doctorId, date: date },
            attributes: ["id", "start_time", "end_time", "interval", "available_slots"],
            include: [
                {
                    model: db.Appointments,
                    as: "appointments",
                    attributes: ["time_slot"],
                },
            ],
        });

        if (!schedule) {
            throw new AppError("The doctor's schedule for the specified date was not found", 404);
        }

        if (!schedule.available_slots.includes(timeSlot)) {
            throw new AppError(`Time slot ${timeSlot} is not available`, 400);
        }

        return schedule;
    },
}

module.exports = ScheduleService;