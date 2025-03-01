/*
*   This feature is one of core functionalities.
*/

const express = require('express')
const { getAllLogs, issueLogs, get_IssueBy } = require('./controller');

const router = express.Router();

router.get('/', getAllLogs);
router.get('/', get_IssueBy);
router.post('/', issueLogs);

module.exports = router;