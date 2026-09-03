const { body, query } = require('express-validator');

const filterDateExist = [
    query("startDate")
        .exists().withMessage("Start date is required")
];

const createDataExist = [
    body("doctorId")
        .exists().withMessage("Doctor is required"),
    body("serviceId")
        .exists().withMessage("Doctor service is required"),
    body("date")
        .exists().withMessage("Date is required"),
    body("timeSlot")
        .exists().withMessage("Time slot is required"),
    body("firstVisit")
        .exists().withMessage("First visit value is required"),
    body("visitType")
        .exists().withMessage("Visit type value is required")
];

module.exports = {
    filterDateExist,
    createDataExist
};