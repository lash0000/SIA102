const mongoose = require('mongoose');
const moment = require('moment-timezone');

const reservationSlot = new mongoose.Schema({
    adult: { type: Number, required: false, default: 0 },
    children: { type: Number, required: false, default: 0 },
    infants: { type: Number, required: false, default: 0 }
}, { _id: false })

const Reservation_Queueing = new mongoose.Schema({
    room_reservation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hotel_rooms',
        required: true
    },
    reservation_slot: {
        type: reservationSlot,
        required: false
    },
    check_in: {
        type: Date,
        required: true
    },
    check_out: {
        type: Date,
        required: true
    },
    initial_price_total: {
        type: Number,
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

const BookingReservation_Queueing = mongoose.model('reservation-queues', Reservation_Queueing);
module.exports = BookingReservation_Queueing;