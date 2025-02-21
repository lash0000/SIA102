const express = require('express');
const { otpRecoveryController } = require('./controller');
const router = express.Router();

// POST route for OTP Registration
router.post('/', otpRecoveryController);

module.exports = router;