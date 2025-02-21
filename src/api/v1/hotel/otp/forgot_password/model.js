const mongoose = require('mongoose');
const moment = require('moment-timezone');

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiration: { type: Date, required: true },
});

// Method to set expiration to 5 minutes from current time in GMT +8 (Taipei Standard Time)
otpSchema.pre('save', function(next) {
    const currentTimeInGMT8 = moment.tz('Asia/Taipei').toDate();
    this.expiration = moment(currentTimeInGMT8).add(5, 'minutes').toDate();
    next();
});

const OTP = mongoose.model('otp_recovery', otpSchema);

module.exports = OTP;