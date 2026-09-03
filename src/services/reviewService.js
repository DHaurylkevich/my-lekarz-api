const db = require("../models");
const sequelize = require("../config/db");
const AppError = require("../utils/appError");
const { getPaginationParams, getTotalPages } = require("../utils/pagination");

const ReviewService = {
    createReview: async ({ roleId, doctorId, rating, comment, tagsIds }) => {
        const t = await sequelize.transaction();

        try {
            const doctor = await db.Doctors.findOne({
                where: { id: doctorId }
            });

            if (!doctor) {
                throw new AppError("Doctor not found", 404);
            }

            const newReview = await db.Reviews.create({
                patient_id: roleId,
                doctor_id: doctorId,
                rating,
                comment,
            }, { transaction: t });

            if (tagsIds && tagsIds.length > 0) {
                const tagInstances = await db.Tags.findAll({
                    where: {
                        id: tagsIds,
                    },
                    transaction: t,
                });
                await newReview.addTags(tagInstances, { transaction: t });
            }

            await t.commit();
            return;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    getAllReviewsWithFilter: async ({ limit, page }, pending) => {
        const { parsedLimit, offset } = getPaginationParams(limit, page);
        const pendingWhere = pending ? { status: 'pending' } : {};

        const { rows, count } = await db.Reviews.findAndCountAll({
            limit: parsedLimit,
            offset: offset,
            where: pendingWhere,
            order: [['createdAt', 'DESC']],
            attributes: ["id", "comment", "rating", "createdAt"],
            include: [
                {
                    model: db.Doctors,
                    as: "doctor",
                    attributes: ["rating"],
                    include: [
                        {
                            model: db.Users,
                            as: "user",
                            attributes: ["first_name", "last_name"]
                        }
                    ]
                },
                {
                    model: db.Patients,
                    as: "patient",
                    attributes: ["id"],
                    include: [
                        {
                            model: db.Users,
                            as: "user",
                            attributes: ["first_name", "last_name", "photo"]
                        }
                    ]
                },
                {
                    model: db.Tags,
                    as: "tags",
                    attributes: ["name"],
                    through: { attributes: [] },
                }
            ],
        });

        const totalPages = getTotalPages(count, parsedLimit, page);

        if (!rows.length) {
            return { pages: 0, reviews: [] };
        }

        return { pages: totalPages, reviews: rows };
    },
    getAllReviewsByClinic: async (clinicId, { sortDate, sortRating, limit, page }) => {
        const { parsedLimit, offset } = getPaginationParams(limit, page);

        const { rows, count } = await db.Reviews.findAndCountAll({
            limit: parsedLimit,
            offset: offset,
            order: [
                ['rating', sortRating === 'desc' ? 'DESC' : 'ASC'],
                ['createdAt', sortDate === 'desc' ? 'DESC' : 'ASC']
            ],
            attributes: ["id", "comment", "rating", "createdAt"],
            where: { status: 'approved' },
            include: [
                {
                    model: db.Doctors,
                    as: "doctor",
                    where: { clinic_id: clinicId },
                    attributes: ["id", "description", "rating", "user_id"],
                    include: [
                        {
                            model: db.Users,
                            as: "user",
                            attributes: ["first_name", "last_name"]
                        }
                    ]
                },
                {
                    model: db.Patients,
                    as: "patient",
                    attributes: ["id"],
                    include: [
                        {
                            model: db.Users,
                            as: "user",
                            attributes: ["first_name", "last_name", "photo"]
                        }
                    ]
                },
                {
                    model: db.Tags,
                    as: "tags",
                    attributes: ["id", "name", "positive"],
                    through: { attributes: [] }
                }
            ],
        });

        const totalPages = getTotalPages(count, parsedLimit, page);

        if (!rows.length) {
            return { pages: 0, reviews: [] };
        }

        return { pages: totalPages, reviews: rows };
    },
    getAllReviewsByDoctor: async ({ doctorId, page, limit }) => {
        const { parsedLimit, offset } = getPaginationParams(limit, page);

        const { rows, count } = await db.Reviews.findAndCountAll({
            limit: parsedLimit,
            offset: offset,
            where: { doctor_id: doctorId, status: 'approved' },
            attributes: ["comment", "rating"],
            include: [
                {
                    model: db.Patients,
                    as: "patient",
                    attributes: ["id"],
                    include: [
                        {
                            model: db.Users,
                            as: "user",
                            attributes: ["first_name", "last_name", "photo"]
                        }
                    ]
                },
                {
                    model: db.Tags,
                    as: "tags",
                    attributes: ["id", "name"],
                    through: { attributes: [] }
                }
            ]
        });

        const totalPages = getTotalPages(count, parsedLimit, page);

        if (!rows.length) {
            return { pages: 0, reviews: [] };
        }

        return { pages: totalPages, reviews: rows };
    },
    moderateReview: async (reviewId, status, moderationComment) => {
        const t = await sequelize.transaction();

        try {
            const review = await db.Reviews.findByPk(reviewId, { transaction: t });

            if (!review) {
                throw new AppError("Review not found", 404);
            }

            await review.update({
                status,
                moderationComment
            }, { transaction: t });

            if (status === 'approved') {
                const doctor = await db.Doctors.findByPk(review.doctor_id);
                const [result] = await db.Reviews.findAll({
                    where: {
                        doctor_id: review.doctor_id,
                        status: 'approved'
                    },
                    attributes: [
                        [sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.col('rating')), 1), 'averageRating']
                    ],
                    raw: true
                });

                await doctor.update({ rating: result.averageRating }, { transaction: t });
            }

            await t.commit();
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    deleteReview: async (reviewId) => {
        const review = await db.Reviews.findByPk(reviewId);
        if (!review) {
            throw new AppError("Review not found");
        }

        await review.destroy();
    },
    leaveFeedback: async (user, reviewData) => {
        if (user.role === "clinic") {
            await db.Clinics.update({ feedbackRating: reviewData }, { where: { id: user.id } });
        } else {
            await db.Patients.update({ feedbackRating: reviewData }, { where: { id: user.roleId } });
        }
    },
    getFeedback: async (user) => {
        let reviews;
        if (user.role === "clinic") {
            reviews = await db.Clinics.findOne({ attributes: ["feedbackRating"], where: { id: user.id } });
        } else {
            reviews = await db.Patients.findOne({ attributes: ["feedbackRating"], where: { id: user.roleId } });
        }
        return { hasFeedback: reviews.feedbackRating !== null };
    },
}

module.exports = ReviewService;