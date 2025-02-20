const express = require('express');
const { otpRegistrationController } = require('./controller');
const router = express.Router();

// POST route for OTP Registration
router.post('/', otpRegistrationController);

module.exports = router;