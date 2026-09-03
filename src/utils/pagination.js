const AppError = require("./appError");

function getPaginationParams(limit, page) {
    const parsedLimit = Math.max(parseInt(limit) || 10, 1);
    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const offset = (pageNumber - 1) * parsedLimit;
    return { parsedLimit, offset };
}

function getTotalPages(count, parsedLimit, page) {
    const totalPages = Math.ceil(count / parsedLimit);
    if (page - 1 > totalPages) {
        throw new AppError("Page not found", 404);
    }
    return totalPages;
}

module.exports = { getPaginationParams, getTotalPages };