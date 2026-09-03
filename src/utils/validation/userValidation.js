const { body } = require('express-validator');

const passwordValidation = [
    body("oldPassword")
        .exists().withMessage("Old password is required"),
    body("newPassword")
        .exists().withMessage("New password is required")
        .isLength({ min: 9 }).withMessage("Password must be at least 8 characters")
];

const dataExistValidation = [
    body("userData")
        .exists().withMessage("User data is required"),
    body("addressData")
        .exists().withMessage("Address data is required")
];

module.exports = {
    passwordValidation,
    dataExistValidation
};