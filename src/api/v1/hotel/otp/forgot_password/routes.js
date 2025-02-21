const express = require('express');
const { getOTP_Recovery, otpRecoveryController } = require('./controller');
const router = express.Router();

// Routes for OTP Registration
router.get('/', getOTP_Recovery);
router.post('/', otpRecoveryController);

module.exports = router;