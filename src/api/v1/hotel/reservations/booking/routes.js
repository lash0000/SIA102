const express = require('express');
const { getAllBookings, getBookById, getBookingsById, addBookReserve, addBookReservation, getAllArchives, getAllArchivesById, addArchive } = require('./controller');

const router = express.Router();

router.get('/', getAllBookings);
router.get('/:id', getBookingsById);
router.get('/book/:id', getBookById);
router.post('/pay-auth', addBookReservation); // this is for paypal kasoo idk
router.post('/', addBookReserve);
router.get('/archives', getAllArchives);
router.get('/archives/:id', getAllArchivesById);
router.post('/archives', addArchive);

module.exports = router;