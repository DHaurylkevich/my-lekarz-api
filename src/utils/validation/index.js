const { body, param } = require('express-validator');
const AppError = require('../appError');

const validateParam = (paramName, options = {}) => {
    const { matchUser = false } = options;
    return [
        param(paramName)
            .exists().withMessage(`${paramName} is required`)
            .bail()
            .custom((value, { req }) => {
                if (matchUser) {
                    if (!req.user || req.user.id !== value) {
                        throw new AppError(`${paramName} must match the authenticated user's ID`);
                    }
                }
                return true;
            }),
    ];
};

const validateBody = (paramName) => [
    body(paramName)
        .exists().withMessage(`${paramName} is required`)
];

const serviceCreateValidation = [
    body("name")
        .exists().withMessage("Name is required")
        .trim(),
    body("specialtyId")
        .exists().withMessage("SpecialtyId is required"),
    body("price")
        .exists().withMessage("Price is required")
        .trim()
];

const countCheck = (number, min, max) => [
    body(number)
        .isInt({ min, max }).withMessage(`The ${number} must be between ${min} and ${max} characters`)
];

module.exports = {
    validateParam,
    validateBody,
    serviceCreateValidation,
    countCheck,
};