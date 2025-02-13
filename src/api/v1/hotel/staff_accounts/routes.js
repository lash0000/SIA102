const express = require('express');
const { getAllRecords, getRecordById, createRecord, updateRecord } = require('./controller');

const router = express.Router();

router.get('/', getAllRecords); // GET all data
router.get('/:id', getRecordById); // GET a specific data by ID
router.post('/', createRecord); // POST issuance for a new record
router.put('/:id', updateRecord); // PUT and UPDATE the existing account id
// router.delete('/:id', deleteAccountById);

module.exports = router;