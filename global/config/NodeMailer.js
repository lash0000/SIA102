const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD, // Your gmail app password
    },
});

// Function to send the email
const Send = async (email, emailBody) => {
    try {
        const result = await transporter.sendMail({
            from: {
                name: "StaySuite | Support",
                address: process.env.MAIL_USERNAME,
            },
            to: email,
            subject: "One Time Password",
            html: emailBody,
        });

        return result;
    } catch (err) {
        throw new Error(err.message);
    }
};

module.exports = { transporter, Send };