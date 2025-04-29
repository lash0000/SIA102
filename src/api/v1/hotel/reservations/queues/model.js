const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');

// Import the models needed for validation
const HotelRoom = require('../room_management/model'); // adjust path if needed
const GuestUser = require('../guest_users/model'); // adjust path if needed

const Reservation_Queueing = new mongoose.Schema({
    reservation_queues: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hotel_rooms',
        required: true
    },
    guest_issued_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hotel_guest_users',
        required: true
    },
    reservation_queue_added: {
        type: Date,
        default: () => moment.tz('Asia/Manila').toDate()
    }
});

// Pre-save validation
Reservation_Queueing.pre('save', async function (next) {
    try {
        // Validate reservation_queues exists
        const room = await HotelRoom.findById(this.reservation_queues);
        if (!room) {
            const error = new Error('Invalid reservation_queues ID: No matching hotel room found.');
            error.statusCode = 400;
            return next(error);
        }

        // Validate guest_issued_by exists
        const guest = await GuestUser.findById(this.guest_issued_by);
        if (!guest) {
            const error = new Error('Invalid guest_issued_by ID: No matching guest user found.');
            error.statusCode = 400;
            return next(error);
        }

        next();
    } catch (err) {
        next(err);
    }
});

const BookingReservation_Queueing = mongoose.model('reservation-queues', Reservation_Queueing);
module.exports = BookingReservation_Queueing;