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
const booking_reservations = require('../api/v1/hotel/reservations/booking/routes');
const activityLogs = require('../api/v1/hotel/activity_logs/routes');
const guestNotify = require('../api/v1/hotel/guest_notify/routes');
const attendanceLog = require('../api/v1/hotel/attendance/routes');
const landingHome = require('../api/v1/hotel/landing/home/routes');
const landingFAQ = require('../api/v1/hotel/landing/faq/routes');
const landingArticles = require('../api/v1/hotel/landing/articles/routes');
const forumAssistance = require('../api/v1/hotel/forum/routes');

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
router.use('/booking-reservation', booking_reservations);
router.use('/hotel-activity-logs', activityLogs);
router.use('/guest-notify', guestNotify);
router.use('/attendance-log', attendanceLog);
router.use('/landing-home', landingHome);
router.use('/landing-faqs', landingFAQ);
router.use('/landing-articles', landingArticles);
router.use('/forum-assistance', forumAssistance);

module.exports = router;