// I need to build this for sake of my VB haha

// This is optional if you want to store OTPs temporarily for validation
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiration: { type: Date, required: true }, // OTP expiration time
});

const OTP = mongoose.model('otp_registrations', otpSchema);

module.exports = OTP;