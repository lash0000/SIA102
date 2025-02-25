// src/api/v1/hotel/uploads/helpers.js

// UPLOADS ROUTER (IMPORT THOSE HANDLERS)

const express = require('express');

const uploads_employee_records = require('./employee_records/routes');

const router = express.Router();

// Define it
router.use('/employee_records', uploads_employee_records);

module.exports = router;