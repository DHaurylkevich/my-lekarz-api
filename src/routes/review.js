const express = require("express");
const router = express.Router();
const ReviewController = require("../controllers/reviewController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { validateRequest } = require("../middleware/errorHandler");
const { countCheck, validateBody } = require("../utils/validation/index");

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctorId:
 *                 type: string
 *                 example: 1
 *               rating:
 *                 type: number
 *                 example: 2
 *               comment:
 *                 type: string
 *                 example: "loren loren Larson"
 *               tagsIds:
 *                 type: array
 *                 example: [1,2,3]
 *             required:
 *               - doctorId
 *               - rating
 *               - comment
 *               - tagsIds
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review created successfully"
 */
router.post("/reviews/", isAuthenticated, hasRole("patient"), countCheck("rating", 1, 5), validateRequest, ReviewController.createReview);
/**
 * @swagger
 * /admins/reviews:
 *   get:
 *     summary: get all reviews for admin
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pages:
 *                   type: number
 *                   example: 2
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                         example: 1
 *                       comment:
 *                         type: string
 *                         example: "Alius speculum tener subiungo conscendo ter incidunt aeternus."
 *                       rating:
 *                         type: number
 *                         example: 2
 *                       createdAt:
 *                         type: date
 *                         example: "2025-01-30T19:01:31.210Z"
 *                       doctor:
 *                         type: object
 *                         properties:
 *                           rating:
 *                             type: number
 *                             example: 2.5
 *                           user:
 *                             type: object
 *                             properties:
 *                               first_name:
 *                                 type: string
 *                                 example: "Charlotte"
 *                               last_name:
 *                                 type: string
 *                                 example: "Schumm"
 *                       patient:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 18
 *                           user:
 *                             type: object
 *                             properties:
 *                               first_name:
 *                                 type: string
 *                                 example: "Zora"
 *                               last_name:
 *                                 type: string
 *                                 example: "Lemke"
 *                               photo:
 *                                 type: string
 *                                 example: "https://avatars.githubusercontent.com/u/82634702"
 *                       tags:
 *                         type: array
 *                         items: 
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "Expensive prices"
 */
router.get("/admins/reviews", isAuthenticated, hasRole("admin"), ReviewController.getAllReviews);
/**
 * @swagger
 * /admins/reviews/moderate:
 *   get:
 *     summary: get all reviews for admin moderated
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pages:
 *                   type: number
 *                   example: 2
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                         example: 1
 *                       comment:
 *                         type: string
 *                         example: "Alius speculum tener subiungo conscendo ter incidunt aeternus."
 *                       rating:
 *                         type: number
 *                         example: 2
 *                       createdAt:
 *                         type: date
 *                         example: "2025-01-30T19:01:31.210Z"
 *                       doctor:
 *                         type: object
 *                         properties:
 *                           rating:
 *                             type: number
 *                             example: 2.5
 *                           user:
 *                             type: object
 *                             properties:
 *                               first_name:
 *                                 type: string
 *                                 example: "Charlotte"
 *                               last_name:
 *                                 type: string
 *                                 example: "Schumm"
 *                       patient:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 18
 *                           user:
 *                             type: object
 *                             properties:
 *                               first_name:
 *                                 type: string
 *                                 example: "Zora"
 *                               last_name:
 *                                 type: string
 *                                 example: "Lemke"
 *                               photo:
 *                                 type: string
 *                                 example: "https://avatars.githubusercontent.com/u/82634702"
 *                       tags:
 *                         type: array
 *                         items: 
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "Expensive prices"
 */
router.get("/admins/reviews/moderate", isAuthenticated, hasRole("admin"), ReviewController.getAllPendingReviews);
/**
 * @swagger
 * /admins/reviews/{reviewId}:
 *   delete:
 *     summary: delete a review
 *     tags: [Reviews]
 *     parameters:
 *       - name: reviewId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review deleted successfully"
 */
router.delete("/admins/reviews/:reviewId", isAuthenticated, hasRole("admin"), ReviewController.deleteReview);
/**
 * @swagger
 * /admins/reviews/{reviewId}/moderate:
 *   patch:
 *     summary: Moderate review
 *     tags: [Reviews]
 *     parameters:
 *       - name: reviewId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, pending', ]
 *                 example: approved
 *               moderationComment:
 *                 type: string
 *                 example: "Nice comment"
 *             required:
 *               - status
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review moderated successfully"
 */
router.patch("/admins/reviews/:reviewId/moderate", isAuthenticated, hasRole("admin"), validateBody("status"), validateRequest, ReviewController.moderateReview);
/**
 * @swagger
 * /clinics/{clinicId}/reviews:
 *   get:
 *     summary: Get all comments by clinic
 *     tags: [Reviews]
 *     parameters:
 *       - name: clinicId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: sortDate
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *       - name: sortRating
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pages:
 *                   type: number
 *                   example: 2
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 67
 *                       comment:
 *                         type: string
 *                         example: "Distinctio curiositas anser."
 *                       rating:
 *                         type: integer
 *                         example: 1
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-11-30T15:38:11.666Z"
 *                       doctor:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 18
 *                           description:
 *                             type: string
 *                             example: "Impedit verumtamen tener aureus bellum tenax adficio cultura."
 *                           rating:
 *                             type: number
 *                             format: float
 *                             example: 4.3
 *                           user_id:
 *                             type: integer
 *                             example: 36
 *                           user:
 *                             type: object
 *                             properties:
 *                               first_name:
 *                                 type: string
 *                                 example: "Janiya"
 *                               last_name:
 *                                 type: string
 *                                 example: "Ward"
 *                       patient:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 16
 *                           user:
 *                             type: object
 *                             properties:
 *                               first_name:
 *                                 type: string
 *                                 example: "Norma"
 *                               last_name:
 *                                 type: string
 *                                 example: "Borer"
 *                               photo:
 *                                 type: string
 *                                 example: "https://avatars.githubusercontent.com/u/88169697"
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 3
 *                             name:
 *                               type: string
 *                               example: "Friendly staff"
 *                             positive:
 *                               type: boolean
 *                               example: true
 */
router.get("/clinics/:clinicId/reviews", ReviewController.getAllReviewsByClinic);
/**
 * @swagger
 * /doctors/{doctorId}/reviews:
 *   get:
 *     summary: Get all reviews 
 *     tags: [Reviews]
 *     parameters:
 *       - name: doctorId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pages:
 *                   type: number
 *                   example: 2
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       comment:
 *                         type: string
 *                         example: "Distinctio curiositas anser."
 *                       rating:
 *                         type: integer
 *                         example: 1
 *                       patient:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 16
 *                           user:
 *                             type: object
 *                             properties:
 *                               first_name:
 *                                 type: string
 *                                 example: "Norma"
 *                               last_name:
 *                                 type: string
 *                                 example: "Borer"
 *                               photo:
 *                                 type: string
 *                                 example: "https://avatars.githubusercontent.com/u/88169697"
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 3
 *                             name:
 *                               type: string
 *                               example: "Friendly staff"
 */
router.get("/doctors/:doctorId/reviews", ReviewController.getAllReviewsByDoctor);
/**
 * @swagger
 * /reviews/feedback:
 *   patch:
 *     summary: create new feedback by patient or clinic  
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 example: 3 
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successful"

 */
router.patch("/reviews/feedback", isAuthenticated, hasRole(["clinic", "patient"]), countCheck("rating", 1, 5), validateRequest, ReviewController.leaveFeedback);
/**
 * @swagger
 * /reviews/feedback:
 *   get:
 *     summary: Check if the patient or clinic has left a review
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: Information about whether the clinic has left a review
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasFeedback:
 *                   type: boolean
 *                   example: true
 */
router.get("/reviews/feedback", isAuthenticated, hasRole(["clinic", "patient"]), ReviewController.getFeedback);

module.exports = router;