const mongoose = require('mongoose');
const OTP = require('./model');
const { Send } = require('../../../../../../global/config/NodeMailer');

const connectToDB = async () => {
    try {
        const dbName = process.env.MONGODB_URI.split('/').pop().split('?')[0];
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Connected to MongoDB database: ${dbName}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 999999);
    return otp;
};

// OTP (GET Retrieval)

const getOTP_Recovery = async (req, res) => {
    try {
        await connectToDB();
        const otp_recovery_records = await OTP.find();
        res.status(200).json(otp_recovery_records);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching otp data', error });
    }
}

// OTP Registration Controller
const otpRecoveryController = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        // Connect to DB
        await connectToDB();

        // Generate 6-digit OTP
        const otp = generateOTP();

        // Set OTP expiration time (5 minutes from now)
        const expirationTime = new Date(Date.now() + 5 * 60 * 1000);

        // Store OTP in the database
        const otpEntry = new OTP({
            email,
            otp,
            expiration: expirationTime,
        });

        await otpEntry.save();

        // Define FormatMail directly here in the controller
        const FormatMail = (otp) => {
            return `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
                    <h2 style="color: #333;">Your One-Time Password (OTP)</h2>
                    <p>Hello,</p>
                    <p>Use the OTP below to proceed with account recovery:</p>
                    <h1 style="letter-spacing: 5px; text-align: center;">${otp}</h1>
                    <p>This OTP is valid for a limited time. Do not share it with anyone.</p>
                    <p>Thank you for choosing SIA102 Hotel Services.</p>
                    <hr>
                    <p style="font-size: 12px; color: #888;">If you didn't request this OTP, please ignore this email.</p>
                </div>
            `;
        };

        // Send OTP email using the FormatMail function defined in the controller
        const emailBody = FormatMail(otp);
        const emailResponse = await Send(email, emailBody);

        // Respond with Success using the res object
        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            otp: otp,
            data: emailResponse,
        });
    } catch (error) {
        console.error(error);

        // Handle errors and send the response back
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

module.exports = { getOTP_Recovery, otpRecoveryController };