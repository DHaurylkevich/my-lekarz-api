const NODE_ENV = process.env.NODE_ENV;
const AppError = require("../utils/appError");
const logger = require("../utils/logger");
const { validationResult } = require("express-validator");

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorDetails = errors.array().map((err) => ({
            message: err.msg,
        }));

        next(new AppError(errorDetails[0].message, 400));
    }
    next();
};

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "Error";
    if (res.headersSent) {
        return next(err);
    }


    if (err.isOperational || NODE_ENV === "test" || NODE_ENV === "development") {
        logger.warn(`${err.statusCode} - ${err.message}`);
        console.log({
            message: err.message,
            error: err
        });

        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack,
            error: err
        })
    } else {
        res.status(500).json({
            status: "error",
            message: err.message || "Internal Server Error"
        });
    }
};

module.exports = {
    errorHandler,
    validateRequest
};