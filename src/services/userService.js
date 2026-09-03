const { Op } = require("sequelize");
const db = require("../models");
const hashingPassword = require("../utils/passwordUtil");
const bcrypt = require("bcrypt");
const cloudinary = require("../middleware/upload");
const AppError = require("../utils/appError");
const sequelize = require("../config/db");

const UserService = {
    createUser: async (userData, t) => {
        const foundUser = await db.Users.findOne({ where: { email: userData.email } });
        if (foundUser) {
            throw new AppError("User already exist", 404);
        }

        userData.password = await hashingPassword(userData.password);
        return await db.Users.create(userData, { transaction: t });
    },
    getUserById: async (userId, role) => {
        const user = await db.Users.findByPk(userId,
            {
                attributes: { exclude: ["password", "createdAt", "updatedAt", "resetToken", "role"] },
                include: [{
                    model: db.Addresses,
                    as: "address",
                    attributes: { exclude: ["createdAt", "updatedAt", "clinic_id", "user_id"] }
                }]
            }
        );

        if (!user) {
            throw new AppError("User not found", 404);
        }

        if (role === "doctor") {
            const doctor = await user.getDoctor({
                attributes: ["rating", "hired_at", "description"],
                include: [
                    { model: db.Specialties, as: "specialty", attributes: ["id", "name"] },
                    { model: db.Clinics, as: "clinic", attributes: ["name"] },
                ]
            });

            if (!doctor) {
                return new AppError("Doctor not found", 404);
            }

            return { ...user.dataValues, ...doctor.dataValues };
        }
        return user;
    },
    findUserByParam: async (param) => {
        let user = await db.Users.findOne({
            where: { [Op.or]: [{ email: param }, { phone: param }, { pesel: param }] },
            include: {
                model: db.Doctors,
                as: "doctor",
                attributes: ["clinic_id"]
            }
        });

        if (!user) {
            user = await db.Clinics.findOne({ where: { [Op.or]: [{ email: param }, { phone: param }] } });
        }

        return user;
    },
    updateUser: async (userId, userData, addressData) => {
        if ("password" in userData) {
            delete userData.password;
        }

        const t = await sequelize.transaction();
        try {
            const user = await db.Users.findByPk(userId);
            await user.update(userData, { transaction: t });

            const address = await user.getAddress();
            if (address) {
                await address.update({ ...addressData, user_id: user.id }, { transaction: t });
            } else {
                await user.createAddress(addressData, { transaction: t });
            }

            await t.commit();

            return user;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    updateImage: async (userId, image) => {
        try {
            let user = await db.Users.findByPk(userId);
            if (!user) {
                user = await db.Clinics.findByPk(userId);
            }
            if (!user) {
                throw new AppError("User not found", 404);
            }
            if (user.photo !== null && image) {
                await cloudinary.deleteFromCloud(user.photo);
            }

            await user.update({ photo: image }, { returning: true });
        } catch (err) {
            if (image) await cloudinary.deleteFromCloud(image);
            throw err;
        }
    },
    updatePassword: async (user, oldPassword, newPassword) => {
        const userId = user.id;
        let entity;
        if (user.role !== "clinic") {
            entity = await db.Users.findByPk(userId);
        } else {
            entity = await db.Clinics.findByPk(userId);
        }
        if (!entity) {
            throw new AppError("User not found", 404);
        }

        const match = await bcrypt.compare(oldPassword, entity.password);
        if (!match) {
            throw new AppError("Password Error", 400);
        };

        newPassword = await hashingPassword(newPassword);
        return await entity.update({ password: newPassword });
    },
    deleteUserById: async (userId) => {
        const user = await db.Users.findByPk(userId);

        if (user.photo !== null) {
            await cloudinary.deleteFromCloud(user.photo);
        }

        await user.destroy({ force: true });
    }
}

module.exports = UserService;