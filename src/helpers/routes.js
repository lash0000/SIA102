// MAIN ROUTER (IMPORT THOSE HANDLERS) = ito yung root route directory.

const express = require('express');
const employeeRecords = require('../api/v1/hotel/staff_accounts/routes');
const OTPRegistration = require('../api/v1/hotel/otp/registration/routes');
const OTPRecovery = require('../api/v1/hotel/otp/forgot_password/routes');
const uploadRoutes = require('../api/v1/hotel/uploads/helpers');
const auditLogs = require('../api/v1/hotel/audit_logs/routes');
const room_management = require('../api/v1/hotel/room_management/routes');
const userLogin = require('../api/v1/hotel/staff_accounts/auth/routes');
const guestRecords = require('../api/v1/hotel/guest_users/routes');
const guestLogin = require('../api/v1/hotel/guest_users/auth/routes');
const chatAssistance = require('../api/v1/hotel/assistance_chat/routes');
const reservation_queue = require('../api/v1/hotel/reservations/queues/routes');

const router = express.Router();

// Define the route handlers
router.use('/staff_accounts', employeeRecords);
router.use('/staff_accounts/auth', userLogin);
router.use('/otp/registration', OTPRegistration);
router.use('/otp/forgot_password', OTPRecovery);
router.use('/uploads', uploadRoutes);
router.use('/audit_logs', auditLogs);
router.use('/hotel_rooms', room_management);
router.use('/guest_accounts', guestRecords);
router.use('/guest_accounts/auth', guestLogin);
router.use('/hotel-chats', chatAssistance);
router.use('/booking-reservation/queues', reservation_queue);

module.exports = router;