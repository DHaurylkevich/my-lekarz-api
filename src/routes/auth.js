const express = require("express");
const router = express.Router();
const passport = require("passport");
const AppError = require("../utils/appError");
const AuthController = require("../controllers/authController");

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User authentication
 *     tags: [Auth]
 *     servers:
 *       - url: http://localhost:3000
 *       - url: https://doc-web-rose.vercel.app
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               loginParam:
 *                 type: string
 *                 description: User's email, phone, or PESEL
 *                 example: "doctor@gmail.com"
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: "123456789"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 */
router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new AppError(info.message || "Invalid credentials", 404));
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return AuthController.login(req, res, next, info);
        });
    })(req, res, next);
});
/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     servers:
 *       - url: http://localhost:3000
 *       - url: https://doc-web-rose.vercel.app
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "test@gmail.com"
 *               password:
 *                 type: string
 *                 example: "123456789"
 */
router.post("/register", AuthController.register);
/**
 * @swagger
 * /logout:
 *   get:
 *     summary: User logout
 *     tags: [Auth]
 *     servers:
 *       - url: http://localhost:3000
 *       - url: https://doc-web-rose.vercel.app
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 */
router.get("/logout", AuthController.logout);
/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Start Google authentication
 *     tags: [Auth]
 *     servers:
 *       - url: http://localhost:3000
 *       - url: https://doc-web-rose.vercel.app
 */
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google authentication callback URL
 *     tags: [Auth]
 *     servers:
 *       - url: http://localhost:3000
 *       - url: https://doc-web-rose.vercel.app
 */
router.get("/auth/google/callback",
    passport.authenticate("google", { failWithError: true, failureMessage: true, failureRedirect: 'https://mojlekarz.netlify.app/login' }), AuthController.googleCallback);
/**
 * @swagger
 *   /forgot-password:
 *     post:
 *       summary: Sends a password reset link
 *       description: Sends a password reset token to the email of an existing user or clinic. The link may be malformed because the correct password reset page address is needed.
 *       tags: [Auth]
 *       servers:
 *         - url: http://localhost:3000
 *         - url: https://doc-web-rose.vercel.app
 *       requestBody:
 *         description: User's email
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   example: email@gmail.com
 *                   description: Email
 */
router.post("/forgot-password", AuthController.requestPasswordReset);
/**
 * @swagger
 * /set-password:
 *   post:
 *     summary: Sets a new password for the user or clinic
 *     tags: [Auth]
 *     servers:
 *       - url: http://localhost:3000
 *       - url: https://doc-web-rose.vercel.app
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 */
router.post("/set-password", AuthController.setPassword);

module.exports = router;