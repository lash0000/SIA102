const mongoose = require('mongoose');
const moment = require('moment-timezone');

const phoneSchema = new mongoose.Schema({
    phone_number: { type: String, required: true },
    otp: { type: String, required: true },
    expiration: { type: Date, required: true },
})

phoneSchema.pre('save', function(next) {
    const currentTimeInGMT8 = moment.tz('Asia/Manila').toDate();
    this.expiration = moment(currentTimeInGMT8).add(5, 'minutes').toDate();
    next();
});

const OTP_Phone_Number = mongoose.model('otp_phone_verify', phoneSchema);

module.exports = OTP_Phone_Number;