const mongoose = require('mongoose');

const GuestAuthSchema = new mongoose.Schema({
    issued_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hotel_guest_users',
        required: true
    },
    refresh_token: {
        type: String,
        required: true
    },
    // access_token: {
    //     type: String,
    //     required: true
    // },
    issued_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('guest_auth_sessions', GuestAuthSchema);
