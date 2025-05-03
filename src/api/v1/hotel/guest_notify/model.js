const moment = require('moment-timezone');
const mongoose = require('mongoose');

const guestNotify = new mongoose.Schema({
    issued_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hotel_guest_users',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    action_description: {
        type: String,
        required: true
    },
    action_timestamp: {
        type: Date,
        default: () => moment.tz('Asia/Manila').toDate()
    }
})

const GuestNotification = mongoose.model('hotel_activity_logs', guestNotify);
module.exports = { GuestNotification };