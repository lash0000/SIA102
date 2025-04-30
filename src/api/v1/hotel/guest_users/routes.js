/*
*   This feature is for guest account.
*/

const express = require('express');
const { getAllRecords, getRecordById, createRecord, updateRecord, paypalLogin } = require('./controller');

const router = express.Router();

router.get('/', getAllRecords); // GET all data
router.get('/:id', getRecordById); // GET a specific data by ID
router.post('/', createRecord);
router.post('/paypal-auth', paypalLogin)
router.put('/:id', updateRecord);

module.exports = router;