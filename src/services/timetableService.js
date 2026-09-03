const db = require("../models");
const AppError = require("../utils/appError");
const { isValidTimeFormat } = require("../utils/timeUtils");

const TimetableService = {
    createTimetable: async (clinicId, t) => {
        await db.Timetables.bulkCreate(
            Array.from({ length: 7 }, (_, i) => ({
                clinic_id: clinicId,
                day_of_week: i + 1,
            })),
            { transaction: t });
    },
    updateTimetable: async (clinicId, timetablesData) => {
        const validatedData = timetablesData.map(data => {
            if (data.endTime !== null && data.startTime !== null) {
                if (!Number.isInteger(data.dayOfWeek) || data.dayOfWeek < 1 || data.dayOfWeek > 7) {
                    throw new AppError("Invalid day of week. Must be between 1 and 7", 400);
                }
                if (data.endTime !== null && data.startTime !== null && !data.startTime || !data.endTime || !isValidTimeFormat(data.startTime) || !isValidTimeFormat(data.endTime)) {
                    throw new AppError("Invalid time format or missing a variable", 400);
                }
                if (data.startTime >= data.endTime) {
                    throw new AppError("Start time must be before end time", 400);
                }
            }

            return {
                id: data.id,
                clinic_id: clinicId,
                day_of_week: data.dayOfWeek,
                start_time: data.startTime,
                end_time: data.endTime
            };
        });

        return await db.Timetables.bulkCreate(validatedData, { updateOnDuplicate: ["start_time", "end_time"] });
    },
}

module.exports = TimetableService;