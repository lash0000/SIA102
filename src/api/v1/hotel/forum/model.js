const mongoose = require('mongoose');
const moment = require('moment-timezone');

const forumSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['thread'],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hotel_employees_staff_records',
        required: true, // Changed to true since staff must create main threads
    },
    comments: [{
        content: {
            type: String,
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'hotel_guest_users',
            required: true,
        },
        createdAt: {
            type: Date,
            default: () => moment().tz('Asia/Manila').toDate(),
        },
    }],
    createdAt: {
        type: Date,
        default: () => moment().tz('Asia/Manila').toDate(),
    },
    updatedAt: {
        type: Date,
        default: () => moment().tz('Asia/Manila').toDate(),
    },
});

forumSchema.pre('save', function (next) {
    this.updatedAt = moment().tz('Asia/Manila').toDate();
    next();
});

const HotelForums = mongoose.model('hotel-forums', forumSchema);
module.exports = HotelForums;