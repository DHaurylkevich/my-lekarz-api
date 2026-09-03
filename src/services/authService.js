const AppError = require("../utils/appError");
const db = require("../models");
const sequelize = require("../config/db");
const createJWT = require("../utils/createJWT");
const hashingPassword = require("../utils/passwordUtil");
const { resetMail } = require("../utils/mail");
const jwt = require("jsonwebtoken");

const AuthService = {
    requestPasswordReset: async (email) => {
        const t = await sequelize.transaction();

        try {
            let userOrClinic = await db.Users.findOne({ where: { email: email }, transaction: t });
            if (!userOrClinic) {
                userOrClinic = await db.Clinics.findOne({ where: { email: email }, transaction: t });
            }

            if (userOrClinic) {
                const resetToken = createJWT(userOrClinic.id, userOrClinic.role);
                await userOrClinic.update({ resetToken }, { transaction: t });
                await resetMail(email, resetToken);
                await t.commit();
                return;
            } else {
                throw new AppError("User or clinic not found", 404);
            }
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    setPassword: async (token, newPassword) => {
        const t = await sequelize.transaction();

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const role = decoded.role;
            const id = decoded.id;

            let user;
            if (role === "patient" || role === "doctor" || role === "admin") {
                user = await db.Users.findOne({ where: { id: id }, attributes: ["id", "resetToken"] }, { transaction: t });
            } else {
                user = await db.Clinics.findOne({ where: { id: id }, attributes: ["id", "resetToken"] }, { transaction: t });
            }

            if (!user || user.resetToken !== token) {
                throw new AppError("Invalid token", 400);
            }

            const hashedPassword = await hashingPassword(newPassword);
            await user.update({ password: hashedPassword, resetToken: null }, { transaction: t });

            await t.commit();
            return;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }
}

module.exports = AuthService;