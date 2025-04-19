/*
*   This feature is for Employees Information Management (HRIS)
*/

const express = require('express');
const { getAllRecords, getRecordById, createRecord, updateRecord, create_TemporaryRecord } = require('./controller');

const router = express.Router();

router.get('/', getAllRecords); // GET all data
router.get('/:id', getRecordById); // GET a specific data by ID
router.post('/', createRecord);

// POST issuance for every registrations
// This case is applicable if manager did not made attempts to use Add New Staff.
router.post('/temporary', create_TemporaryRecord);
// POST issuance for Add New Staff feature
// This case can be done by Manager (which is Security Team).

router.put('/:id', updateRecord);

module.exports = router;