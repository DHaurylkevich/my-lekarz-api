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
        return;
    }
    next();
};

const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    const isDev = NODE_ENV === "test" || NODE_ENV === "development";

    if (err.isOperational || isDev) {
        if (isDev) {
            // Full trace server-side only - never send the stack to the client
            logger.error(err.stack || err.message);
        } else {
            logger.warn(`${err.statusCode} - ${err.message}`);
        }

        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        logger.error(`${err.statusCode} - ${err.message}`);
        res.status(err.statusCode).json({
            status: "error",
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    errorHandler,
    validateRequest
};