const express = require("express");
const router = express.Router();
const clinicRouter = require("./clinic");
const userRouter = require("./user");
const patientRouter = require("./patient");
const doctorRouter = require("./doctor");
const serviceRouter = require("./service");
const specialtyRouter = require("./specialty");
const scheduleRouter = require("./schedule");
const appointmentRouter = require("./appointments");
const reviewRouter = require("./review");
const tagRouter = require("./tag");
const categoryRouter = require("./category");
const postRouter = require("./post");
const notionRouter = require("./notion");
const medicationRouter = require("./medication");
const prescriptionRouter = require("./prescription");
const authRouter = require("./auth");
const chatRouter = require("./chat");
const messageRouter = require("./messages");
const timetableRouter = require("./timetables");
const searchRouter = require("./search");
const statisticRouter = require("./statistics");
const documentRouter = require("./documents");
const { isAuthenticated, hasRole } = require('../middleware/auth');
const upload = require("../middleware/upload").uploadFiles;

router.use("/", authRouter);
router.use("/api", searchRouter);
router.use("/api", statisticRouter);
router.use("/api", documentRouter);

router.use("/api", appointmentRouter);
router.use("/api", clinicRouter);
router.use("/api", userRouter);
router.use("/api", patientRouter);
router.use("/api", doctorRouter);
router.use("/api", serviceRouter);
router.use("/api", specialtyRouter);
router.use("/api", scheduleRouter);
router.use("/api", reviewRouter);
router.use("/api", tagRouter);
router.use("/api", categoryRouter);
router.use("/api", postRouter);
router.use("/api", notionRouter);
router.use("/api", medicationRouter);
router.use("/api", prescriptionRouter);
router.use("/api", chatRouter);
router.use("/api", messageRouter);
router.use("/api", timetableRouter);

/**
 * @swagger
 * /api/user/role:
 *   post:
 *     summary: checks user role
 *     tags: [Utils]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 example: admin
 *     responses:
 *       201:
 *         description: successfully
 */
router.post("/api/user/role", (req, res, next) => {
    const role = req.body.role;
    hasRole(role)(req, res, next);
}, (req, res) => {
    res.status(201).json("Successful");
});

router.post("/api/upload/file", upload.single("file"), (req, res) => {
    res.json({ message: "File uploaded successfully", fileUrl: req.file.path });
});

/**
 * @swagger
 * /api/protected:
 *   get:
 *     summary: To verify that the token is working 
 *     tags: [Utils]
 *     responses:
 *       200:
 *         content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "You have accessed a protected route"
 */
router.get("/api/protected", isAuthenticated, (req, res) => {
    res.status(200).json({ message: `You have accessed a protected route.` });
});

router.get("/api", (req, res) => {
    res.send("API");
});


module.exports = router;