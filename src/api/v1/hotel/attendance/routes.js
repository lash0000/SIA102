/*
*   This feature is one of core functionalities.
*/

const express = require('express')
const { getAllAttendance, createAttendance } = require('./controller');

const router = express.Router();

router.get('/', getAllAttendance);
// router.get('/:id', get_IssueBy);
router.post('/', createAttendance);

module.exports = router;