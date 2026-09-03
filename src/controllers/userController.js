const UserService = require("../services/userService");
const ClinicService = require("../services/clinicService");
const AppError = require("../utils/appError");

const UserController = {
    getUserAccount: async (req, res, next) => {
        const user = req.user;

        try {
            let userInDb;

            if (user.role === "clinic") {
                userInDb = await ClinicService.getClinicById(user.id);
            } else {
                userInDb = await UserService.getUserById(user.id, user.role);
            }

            res.status(200).json(userInDb);
        } catch (err) {
            next(err);
        }
    },
    updateUser: async (req, res, next) => {
        const { userData, addressData } = req.body;
        const userId = req.user.id;

        try {
            await UserService.updateUser(userId, userData, addressData);
            res.status(200).json({ message: "User update successfully" });
        } catch (err) {
            next(err);
        }
    },
    updateUserPassword: async (req, res, next) => {
        const { oldPassword, newPassword } = req.body;
        const user = req.user;

        try {
            if (!user || !oldPassword || !newPassword) {
                throw new AppError("Valid data error", 400);
            }

            await UserService.updatePassword(user, oldPassword, newPassword);
            res.status(200).json({ message: "Password changed successfully" });
        } catch (err) {
            next(err);
        }
    },
    deleteUser: async (req, res, next) => {
        const user = req.user;

        try {
            if (user.role === "clinic") {
                await ClinicService.deleteClinicById(user.id);
            } else {
                await UserService.deleteUserById(user.id);
            }
            req.logout((err) => {
                if (err) throw new AppError("Error during logout", 500);

                req.session.destroy((err) => {
                    if (err) {
                        return next(new AppError("Error destroying session", 500));
                    }
                    res.clearCookie('connect.sid');
                    res.status(200).json({ message: "User deleted successfully" });
                });
            });
        } catch (err) {
            next(err);
        }
    },
    updateImage: async (req, res, next) => {
        const userId = req.user.id;

        if (req.file) {
            const image = req.file.path;

            try {
                await UserService.updateImage(userId, image);
                res.status(200).json({ message: "Image uploaded successfully" });
            } catch (err) {
                next(err);
            }
        } else {
            res.status(400).json({ message: "Please provide an image file in the request" });
        }
    }
}

module.exports = UserController;