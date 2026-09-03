const TimetableService = require("../services/timetableService");

const TimetableController = {
    updateTimetable: async (req, res, next) => {
        const clinicId = req.user.id;
        const timetablesData = req.body;

        try {
            const updateTimetable = await TimetableService.updateTimetable(clinicId, timetablesData);
            res.status(200).json(updateTimetable);
        } catch (err) {
            next(err);
        }
    }
};

module.exports = TimetableController;