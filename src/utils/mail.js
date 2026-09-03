const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
    },
});

const resetMail = async (email, resetToken) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Password Reset Request",
        text: `Click the link below to reset your password:\n\n${resetUrl}`,
    };
    await transporter.sendMail(mailOptions);
};


const setPasswordMail = async (email, resetToken) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Set Password Request",
        text: `Click the link below to set your password:\n\n${resetUrl}`,
    };
    await transporter.sendMail(mailOptions);
};

module.exports = { transporter, resetMail, setPasswordMail };
