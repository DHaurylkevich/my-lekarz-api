const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../models");
const userService = require("../services/userService");
const bcrypt = require("bcrypt");

passport.use(new LocalStrategy({
    usernameField: "loginParam",
    passwordField: "password"
}, async (loginParam, password, done) => {
    try {
        const user = await userService.findUserByParam(loginParam);

        if (!user) {
            return done(null, false, { message: "User not found" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await db.Users.findOne({ where: { email: profile.emails[0].value } });

        if (!user) {
            user = await db.Users.create({
                photo: profile.photos[0].value,
                email: profile.emails[0].value,
                first_name: profile.name.givenName,
                last_name: profile.name.familyName,
                role: "patient"
            });
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, cb) => {
    return cb(null, { id: user.id, role: user.role });
});

passport.deserializeUser(async (user, done) => {
    try {
        let userData = { id: user.id, role: user.role };

        if (user.role !== "clinic") {
            const foundUser = await db.Users.findByPk(user.id, {
                attributes: ['id', 'role'],
                include: [
                    { model: db.Doctors, as: 'doctor', attributes: ['id'] },
                    { model: db.Patients, as: 'patient', attributes: ['id'] }
                ]
            });

            if (user.role !== "admin") {
                userData.roleId = foundUser.doctor?.id || foundUser.patient?.id;
            }
        }

        done(null, userData);
    } catch (err) {
        done(err);
    }
});
module.exports = passport;
