const ScheduleService = require("../services/scheduleService");

const ScheduleController = {
    createSchedule: async (req, res, next) => {
        try {
            const clinicId = req.user.id;
            const scheduleData = req.body;

            const newSchedules = await ScheduleService.createSchedule(clinicId, scheduleData);

            return res.status(201).json(newSchedules);
        } catch (err) {
            next(err);
        }
    },
    getScheduleById: async (req, res, next) => {
        const { scheduleId } = req.params;

        try {
            const schedule = await ScheduleService.getScheduleById(scheduleId);

            return res.status(200).json(schedule);
        } catch (err) {
            next(err);
        }
    },
    updateSchedule: async (req, res, next) => {
        const { scheduleId } = req.params;
        const updateData = req.body;
        const clinicId = req.user.id;

        try {
            const updatedSchedule = await ScheduleService.updateSchedule(clinicId, scheduleId, updateData);
            return res.status(200).json(updatedSchedule);
        } catch (err) {
            next(err);
        }
    },
    deleteSchedule: async (req, res, next) => {
        const { scheduleId } = req.params;
        const clinicId = req.user.id;

        try {
            await ScheduleService.deleteSchedule(clinicId, scheduleId);
            res.status(200).json({ message: "Schedule deleted successfully" });
        } catch (err) {
            next(err);
        }
    },
    getAvailableSlotsWithFilter: async (req, res, next) => {
        const { city, specialty, date, limit, page } = req.query;

        try {
            const availableSlot = await ScheduleService.getAvailableSlotsWithFilter({ city, specialty, date, limit, page });
            res.status(200).json(availableSlot);
        } catch (err) {
            next(err);
        }
    },
    getScheduleByRole: async (req, res, next) => {
        const { month = new Date().getMonth() + 1, year = new Date().getFullYear(), doctorIds } = req.query;
        const user = req.user;

        try {
            let schedules;
            if (user.role === "doctor") {
                schedules = await ScheduleService.getScheduleByDoctor({ doctorId: user.roleId, year, month });
            } else {
                schedules = await ScheduleService.getScheduleByClinic({ clinicId: user.id, year, month }, doctorIds);
            }
            return res.status(200).json(schedules);
        } catch (err) {
            next(err);
        }
    },
};

module.exports = ScheduleController;
