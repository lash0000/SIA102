const express = require('express');
const { getAllBookings, getBookById, getBookingsById, addBookReserve, addBookReservation } = require('./controller');

const router = express.Router();

router.get('/', getAllBookings);
router.get('/:id', getBookingsById);
router.get('/book/:id', getBookById);
router.post('/pay-auth', addBookReservation); // this is for paypal kasoo idk
router.post('/', addBookReserve);

module.exports = router;