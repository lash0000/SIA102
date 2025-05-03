/*
*   This feature is for Guest Notifcations.
*/

const express = require('express');
const { getAllNotify, getAllNotifyById, addNotify } = require('./controller');

const router = express.Router();

router.get('/', getAllNotify);
router.get('/:id', getAllNotifyById);
router.post('/', addNotify);

module.exports = router;