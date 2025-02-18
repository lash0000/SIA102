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

// OTP Registration Controller
const otpRegistrationController = async (event) => {
    const { email } = JSON.parse(event.body);

    if (!email) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Email is required" }),
        };
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

        const messageBody = `
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
        
        // Send OTP email to the provided email address
        const emailResponse = await Send(email, otp, messageBody);

        // Respond with Success
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: "OTP sent successfully", otp: otp, data: emailResponse }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: error.message }),
        };
    }
};

module.exports = { otpRegistrationController }