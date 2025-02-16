const { sendEmail, generateOTP } = require('../../../../../helpers/otp/registration/email_registration');
const { generateOTPEmail } = require('../../../../../helpers/otp/registration/template');
const mongoose = require('mongoose');
const OTP = require('./model');

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

        // Generate OTP
        const otp = generateOTP();

        // Set OTP expiration time (e.g., 5 minutes from now)
        const expirationTime = new Date(Date.now() + 5 * 60 * 1000);

        // Store OTP in the database
        const otpEntry = new OTP({
            email,
            otp,
            expiration: expirationTime,
        });

        await otpEntry.save();

        // Prepare Email Content
        const subject = "Your OTP for Registration";
        const text = generateOTPEmail(otp); // Plain text version of the email

        // Send Email
        const response = await sendEmail(email, subject, text);

        // Respond with Success
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: "OTP sent successfully", otp: otp, data: response }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: error.message }),
        };
    }
};


module.exports = otpRegistrationController;