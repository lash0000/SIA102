const mongoose = require('mongoose');

const AuthSchema = new mongoose.Schema({
    issued_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hotel_employees_staff_records',
        required: true
    },
    refresh_token: {
        type: String,
        required: true
    },
    access_token: {
        type: String,
        required: true
    },
    issued_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('auth_sessions', AuthSchema);
