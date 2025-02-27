// MAIN ROUTER (IMPORT THOSE HANDLERS)

const express = require('express');
const employeeRecords = require('../api/v1/hotel/staff_accounts/routes');
const OTPRegistration = require('../api/v1/hotel/otp/registration/routes');
const OTPRecovery = require('../api/v1/hotel/otp/forgot_password/routes');
const uploadRoutes = require('../api/v1/hotel/uploads/helpers');
const auditLogs = require('../api/v1/hotel/audit_logs/routes');

const router = express.Router();

// Define the route handlers
router.use('/staff_accounts', employeeRecords);
router.use('/otp/registration', OTPRegistration);
router.use('/otp/forgot_password', OTPRecovery);
router.use('/uploads', uploadRoutes);
router.use('/audit_logs', auditLogs);

module.exports = router;