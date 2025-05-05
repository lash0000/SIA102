const mongoose = require('mongoose');
const moment = require('moment-timezone');

const contactInfo = new mongoose.Schema({
    email_address: { type: String, required: true },
    phone_number: { type: String, required: false },
    contact_first_name: { type: String, required: true },
    contact_last_name: { type: String, required: true },
    contact_name_suffix: { type: String, required: false },
}, { _id: false })

const orderReceipt = new mongoose.Schema({
    issuance_date: { type: Date, default: () => moment.tz('Asia/Manila').toDate() },
    receipt_expiration: { type: Date, default: () => moment.tz('Asia/Manila').add(15, 'hours').toDate() },
    order_reservation_total: { type: Number, required: true },
})

const Reservations = new mongoose.Schema({
    reservation_room: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hotel_rooms',
        required: true
    }],
    contact_information: {
        type: contactInfo,
        required: false
    },
    booking_issued_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hotel_guest_users',
        required: true
    },
    mode_of_payment: {
        type: String,
        required: true
    },
    receipt_record: {
        type: orderReceipt,
        required: true
    },
    booking_date_added: {
        type: Date,
        default: () => moment.tz('Asia/Manila').toDate()
    }
})

const Booking_Reservation = mongoose.model('booking-reservations', Reservations);
module.exports = Booking_Reservation;