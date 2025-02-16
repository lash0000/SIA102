const { Resend } = require('resend');
const dotenv = require('dotenv');

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

const sendEmail = async (to, subject, html) => {
    try {
        const response = await resend.emails.send({
            from: 'no-reply@stay-suite.com',
            to,
            subject,
            html,
        });
        return response;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

module.exports = { sendEmail, generateOTP };