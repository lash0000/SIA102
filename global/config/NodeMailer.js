const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// Create a transporter then kindly use TLS (port 587) from gmail
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD, // Your gmail app password
    },
});

const Send = async (email, link) => {
    try {
        const result = await new Promise((resolve, reject) => {
            transporter.sendMail(
                {
                    from: {
                        name: "StaySuite | Registration",
                        address: process.env.MAIL_USERNAME,
                    },
                    to: email,                      // Recipient email
                    subject: "OTP Registration",    // Email subject
                    html: FormatMail(link),         // HTML body of the email
                },
                (err, info) => {
                    if (err) {
                        reject(err);
                        return err.message;
                    } else {
                        resolve(info);
                    }
                }
            );
        });

        return result;
    } catch (err) {
        return err.message;
    }
};

const FormatMail = (otp) => {
    const html =
        `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
            <h2 style="color: #333;">Your One-Time Password (OTP)</h2>
            <p>Hello,</p>
            <p>Use the OTP below to complete your registration:</p>
            <h1 style="letter-spacing: 5px; text-align: center;">${otp}</h1>
            <p>This OTP is valid for a limited time. Do not share it with anyone.</p>
            <p>Thank you for choosing SIA102 Hotel Services.</p>
            <hr>
            <p style="font-size: 12px; color: #888;">If you didn't request this OTP, please ignore this email.</p>
        </div>
        `;

    return html;
};

module.exports = { Send };
