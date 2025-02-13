// Import route handlers

const express = require('express');
const employeeRecords = require('../api/v1/hotel/staff_accounts/routes');

const router = express.Router();

// Define the route handlers
router.use('/staff_accounts', employeeRecords);

module.exports = router;