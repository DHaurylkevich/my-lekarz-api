const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const { isAuthenticated } = require("../middleware/auth");
const { passwordValidation } = require('../utils/validation/userValidation');
const { validateRequest } = require('../middleware/errorHandler');
const upload = require("../middleware/upload").uploadImages;

/**
 * @swagger
 * /users/account:
 *   get:
 *     summary: Returns user data, including user role, for all subjects patient, doctor, clinic, admin
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User Information(patient, doctor, clinic, admin)
 */
router.get("/users/account", isAuthenticated, UserController.getUserAccount);
/**
 * @swagger
 * /users:
 *   put:
 *     summary: Updates user data. Works for all entities associated with user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userData:
 *                 type: object
 *                 properties:
 *                   first_name:
 *                     type: string
 *                     example: "Ann"
 *                   last_name:
 *                     type: string
 *                     example: "Kingin"
 *                   email:
 *                     type: string
 *                     example: "new_email@gmail.com"
 *                   gender:
 *                     type: string
 *                     enum: ["male", "female"]
 *                     example: "male"
 *                   pesel:
 *                     type: string
 *                     example: "12345678901"
 *                   phone:
 *                     type: string
 *                     example: "+1234567890"
 *               addressData:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                     example: "Effertzhaven"
 *                   province:
 *                     type: string
 *                     example: "Ohio"
 *                   street:
 *                     type: string
 *                     example: "N Chestnut Street"
 *                   home:
 *                     type: integer
 *                     example: "7903"
 *                   flat:
 *                     type: integer
 *                     example: "495"
 *                   post_index:
 *                     type: string
 *                     example: "37428-7078"
 *     responses:
 *       200:
 *         description: Data update successfully
 */
router.put("/users", isAuthenticated, UserController.updateUser);
/**
 * @swagger
 * /users/password:
 *   patch:
 *     summary: update password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 */
router.patch("/users/password", isAuthenticated, passwordValidation, validateRequest, UserController.updateUserPassword);
/**
 * @swagger
 * /users:
 *   delete:
 *     summary: Deletes user(doctor,patient,clinic) by ID and related items
 *     operationId: deleteUser
 *     tags: [Users]
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successful delete"
 */
router.delete("/users", isAuthenticated, UserController.deleteUser);
/**
 * @swagger
 * /users/photo:
 *   post:
 *     summary: Uploads a new profile picture for an authenticated user
 *     tags: [Users]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile photo updated successfully"
 */
router.post("/users/photo", isAuthenticated, upload.single("image"), UserController.updateImage);

module.exports = router;