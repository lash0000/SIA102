// MAIN ROUTER (IMPORT THOSE HANDLERS)

const express = require('express');
const employeeRecords = require('../api/v1/hotel/staff_accounts/routes');
const OTPRegistration = require('../api/v1/hotel/otp/registration/routes');
const mediaFiles = require('../api/v1/hotel/media_files/routes');

const router = express.Router();

// Define the route handlers
router.use('/staff_accounts', employeeRecords);
router.use('/otp-registration', OTPRegistration);
router.use('/uploads', mediaFiles);

module.exports = router;