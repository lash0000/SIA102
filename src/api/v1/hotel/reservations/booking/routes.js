const express = require('express');
const { getAllBookings, getBookingsById, addBookReserve, addBookReservation } = require('./controller');

const router = express.Router();

router.get('/', getAllBookings);
router.get('/:id', getBookingsById);
router.post('/pay-counter', addBookReserve);
router.post('/', addBookReservation);

module.exports = router;