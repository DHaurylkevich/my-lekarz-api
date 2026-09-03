const { body } = require('express-validator');

const createSchedule = [
    body("start_time")
        .exists().withMessage("Start time is required")
        .isString().withMessage("Start time must be a string")
        .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage("Start time must be in format HH:MM")
        .custom((value) => {
            const [hours, minutes] = value.split(':').map(Number);
            if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                throw new Error('Invalid time format');
            }
            return true;
        }),
    body("end_time")
        .exists().withMessage("End time is required")
        .isString().withMessage("End time must be a string")
        .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage("End time must be in format HH:MM")
        .custom((value) => {
            const [hours, minutes] = value.split(':').map(Number);
            if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                throw new Error('Invalid time format');
            }
            return true;
        })
        .custom((value, { req }) => {
            const startTime = req.body.start_time;
            if (startTime && value <= startTime) {
                throw new Error('End time must be after start time');
            }
            return true;
        }),
    body("interval")
        .exists().withMessage("Interval value is required")
        .isInt({ min: 1, max: 1440 }).withMessage("Interval must be an integer between 1 and 1440 minutes")
];

module.exports = {
    createSchedule
};