const ReviewService = require("../services/reviewService");

const ReviewController = {
    createReview: async (req, res, next) => {
        const { doctorId, rating, comment, tagsIds } = req.body;

        try {
            const roleId = req.user.roleId;

            await ReviewService.createReview({ roleId, doctorId, rating, comment, tagsIds });

            res.status(201).json({ message: "Review created successfully" });
        } catch (err) {
            next(err);
        }
    },
    getAllReviews: async (req, res, next) => {
        const { limit, page } = req.query;

        try {
            const specialties = await ReviewService.getAllReviewsWithFilter({ page, limit }, false);
            res.status(200).json(specialties);
        } catch (err) {
            next(err);
        }
    },
    getAllPendingReviews: async (req, res, next) => {
        const { limit, page } = req.query;

        try {
            const specialties = await ReviewService.getAllReviewsWithFilter({ page, limit }, true);
            res.status(200).json(specialties);
        } catch (err) {
            next(err);
        }
    },
    getAllReviewsByClinic: async (req, res, next) => {
        const { clinicId } = req.params;
        const { sortDate = 'asc', sortRating = 'asc', limit, page } = req.query;

        try {
            const reviews = await ReviewService.getAllReviewsByClinic(clinicId, { sortDate, sortRating, limit, page });
            res.status(200).json(reviews);
        } catch (err) {
            next(err);
        }
    },
    getAllReviewsByDoctor: async (req, res, next) => {
        const { doctorId } = req.params;
        const { limit, page } = req.query;

        try {
            const reviews = await ReviewService.getAllReviewsByDoctor({ doctorId, page, limit });
            res.status(200).json(reviews);
        } catch (err) {
            next(err);
        }
    },
    moderateReview: async (req, res, next) => {
        const { reviewId } = req.params;
        const { status, moderationComment = null } = req.body;

        try {
            await ReviewService.moderateReview(reviewId, status, moderationComment);
            res.status(200).json({ message: "Review moderated successfully" });
        } catch (err) {
            next(err);
        }
    },
    deleteReview: async (req, res, next) => {
        const { reviewId } = req.params;

        try {
            await ReviewService.deleteReview(reviewId);
            res.status(200).json({ message: "Review deleted successfully" });
        } catch (err) {
            next(err);
        }
    },
    leaveFeedback: async (req, res, next) => {
        const user = req.user;
        const { rating } = req.body;

        try {
            await ReviewService.leaveFeedback(user, rating);

            res.status(201).json({ message: "Successful" });
        } catch (err) {
            next(err);
        }
    },
    getFeedback: async (req, res, next) => {
        const user = req.user;

        try {
            const hasReview = await ReviewService.getFeedback(user);

            res.status(200).json(hasReview);
        } catch (err) {
            next(err);
        }
    },
};

module.exports = ReviewController;