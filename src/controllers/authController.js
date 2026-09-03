const AppError = require("../utils/appError");
const AuthService = require("../services/authService");
const createPatient = require("../services/patientService").createPatient;

const AuthController = {
    login: (req, res) => {
        const userResponse = {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role,
            first_name: req.user.first_name,
            last_name: req.user.last_name
        };

        if (req.user.doctor) {
            userResponse.clinic_id = req.user.doctor.clinic_id;
        }

        res.status(200).json({
            message: "Login successful",
            user: userResponse
        });
    },
    register: async (req, res, next) => {
        const { email, password } = req.body;

        try {
            const user = await createPatient({ email, password });

            req.login(user, (err) => {
                if (err) {
                    return next(new AppError("Error during login", 500));
                }

                const userData = user.toJSON();
                delete userData.password;
                delete userData.resetToken;
                res.json({ user: userData, message: "Registration successful" });
            });
        } catch (err) {
            next(err);
        }
    },
    logout: (req, res, next) => {
        req.logout((err) => {
            if (err) throw new AppError("Error during logout", 500);

            req.session.destroy((err) => {
                if (err) {
                    return next(new AppError("Error destroying session", 500));
                }
                res.clearCookie('connect.sid');
                res.json({ message: "Logout successful" });
            });
        });
    },
    googleCallback: (req, res, next) => {
        try {
            if (!req.user) {
                return res.redirect("https://mojlekarz.netlify.app/login");
            }
            return res.redirect("https://mojlekarz.netlify.app/");
        } catch (err) {
            next(err);
        }
    },
    requestPasswordReset: async (req, res, next) => {
        const { email } = req.body;

        try {
            if (process.env.EMAIL === undefined || process.env.EMAIL_PASS === undefined) {
                res.status(200).json({ message: "Service mail error" });
                return;
            }

            await AuthService.requestPasswordReset(email);
            res.status(200).json({ message: "Password reset link has been sent to your email address" });
        } catch (err) {
            next(err);
        }
    },
    setPassword: async (req, res, next) => {
        const { token, newPassword } = req.body;

        try {
            await AuthService.setPassword(token, newPassword);
            res.status(201).json({ message: "Password has been reset" });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = AuthController;
