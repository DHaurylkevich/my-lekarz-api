const StatisticsService = require("../services/statisticService");
const pdfFile = require("../utils/pdfFile");

const StatisticController = {
    getDoctorStatistics: async (req, res, next) => {
        const doctor = req.user;
        const { startOfMonth, endOfMonth } = req.query;

        try {
            const countPatients = await StatisticsService.countPatients(doctor);
            const countAppointments = await StatisticsService.countAppointments(doctor.roleId, startOfMonth, endOfMonth);
            res.status(200).json({ countPatients, countAppointments });
        } catch (error) {
            next(error);
        }
    },
    getClinicStatistics: async (req, res, next) => {
        const clinic = req.user;

        try {
            const countPatients = await StatisticsService.countPatients(clinic);
            const averageRating = await StatisticsService.averageScore(clinic.id);
            res.status(200).json({ averageRating, countPatients });
        } catch (error) {
            next(error);
        }
    },
    getAdminStatistics: async (req, res, next) => {
        try {
            const countUser = await StatisticsService.mainStatist();
            const statisticUser = await StatisticsService.countNewPatientsAndClinics();
            res.status(200).json({ countUser, statisticUser });
        } catch (error) {
            next(error);
        }
    },
    getAdminStatisticDetails: async (req, res, next) => {
        const { start_date, end_date } = req.query;

        try {
            const countUser = await StatisticsService.mainStatist(start_date, end_date);
            const count = await StatisticsService.ratingsStatistics(start_date, end_date);
            res.status(200).json({ countUser, count });
        } catch (error) {
            next(error);
        }
    },
    getAdminStatisticPDF: async (req, res, next) => {
        const { start_date, end_date } = req.query;

        try {
            const countUser = await StatisticsService.mainStatist(start_date, end_date);
            const count = await StatisticsService.ratingsStatistics(start_date, end_date);
            pdfFile(res, { countUser, count });
            // res.status(200).json({ countUser, count });
        } catch (error) {
            next(error);
        }
    },
    mainPageStatistics: async (req, res, next) => {
        try {
            const count = await StatisticsService.mainPageStatistics();
            res.status(200).json(count);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = StatisticController;