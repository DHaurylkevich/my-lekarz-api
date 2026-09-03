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
 *     responses:
 *       '201':
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: "Registration successful"
 *       '400':
 *         description: Invalid email or password
 *       '404':
 *         description: User already exists
 *       '500':
 *         description: Account created, but automatic login failed
 */
router.post("/register", AuthController.register);
/**
 * @swagger
 * /logout:
 *   get:
 *     summary: User logout
 *     tags: [Auth]
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
 *     responses:
 *       '302':
 *         description: Redirect to Google's OAuth consent screen
 */
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google authentication callback URL
 *     tags: [Auth]
 *     responses:
 *       '302':
 *         description: Redirect to the app (or to the login page on failure)
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
 *       responses:
 *         '200':
 *           description: Password reset link sent (or service mail error)
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *               properties:
 *                 message:
 *                   type: string
 *         '404':
 *           description: No user or clinic with this email
 */
router.post("/forgot-password", AuthController.requestPasswordReset);
/**
 * @swagger
 * /set-password:
 *   post:
 *     summary: Sets a new password for the user or clinic
 *     tags: [Auth]
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
 *     responses:
 *       '201':
 *         description: Password has been reset
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password has been reset"
 *       '400':
 *         description: Missing token or newPassword
 *       '404':
 *         description: Invalid or expired token
 */
router.post("/set-password", AuthController.setPassword);

module.exports = router;