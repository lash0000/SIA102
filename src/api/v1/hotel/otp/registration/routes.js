const express = require('express');
const { getOTP_Registration, otpRegistrationController } = require('./controller');
const router = express.Router();

// Routes for OTP Registration
router.get('/', getOTP_Registration);
router.post('/', otpRegistrationController);

module.exports = router;