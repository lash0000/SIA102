const mongoose = require('mongoose');

const contactInfo = new mongoose.Schema({
    email_address: { type: String, required: true },
    phone_number: { type: String, required: false },
    contact_first_name: { type: String, required: true },
    contact_last_name: { type: String, required: true },
    contact_name_suffix: { type: String, required: false },
}, { _id: false })

// const orderReceipt = new mongoose.Schema({
//     issuance_date: { type: Date, default: () => moment.tz('Asia/Manila').toDate() },
//     receipt_expiration: { type: Date, default: () => moment.tz('Asia/Manila').add(15, 'hours').toDate() },
//     order_reservation_total: { type: Number, required: true },
// })

const ArchiveReservations = new mongoose.Schema({
    reservation_room: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hotel_rooms',
        required: true
    }],
    booking_archive: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'booking-reservations',
        required: true
    }
})

const ArchiveBooking = mongoose.model('booking-archive-reservations', ArchiveReservations);
module.exports = ArchiveBooking;