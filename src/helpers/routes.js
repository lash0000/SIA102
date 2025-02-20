// MAIN ROUTER (IMPORT THOSE HANDLERS)

const express = require('express');
const employeeRecords = require('../api/v1/hotel/staff_accounts/routes');
const OTPRegistration = require('../api/v1/hotel/otp/registration/routes');
const uploadRoutes = require('../api/v1/hotel/uploads/routes');

const router = express.Router();

// Define the route handlers
router.use('/staff_accounts', employeeRecords);
router.use('/otp/registration', OTPRegistration);
router.use('/uploads', uploadRoutes);

module.exports = router;