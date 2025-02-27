/*
*   This feature is one of core functionalities.
*/

const express = require('express')
const { getAllLogs, issueLogs } = require('./controller');

const router = express.Router();

router.get('/', getAllLogs);
router.post('/', issueLogs);

module.exports = router;