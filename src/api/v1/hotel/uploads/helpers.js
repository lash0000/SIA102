// src/api/v1/hotel/uploads/helpers.js

// UPLOADS ROUTER (IMPORT THOSE HANDLERS)

const express = require('express');

const uploads_employee_records = require('./employee_records/routes');
const uploads_rooms = require('./room_management/routes');
const queue_uploads = require('./queues/routes');

const router = express.Router();

// Define it
router.use('/employee_records', uploads_employee_records);
router.use('/room_management', uploads_rooms);
router.use('/queues', queue_uploads);

module.exports = router;