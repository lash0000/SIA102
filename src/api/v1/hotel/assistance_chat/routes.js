/*
*   This feature is for Chat Assistance Group (between Guest,Staffs and Managers).
*/

const express = require('express');
const { getAllChats, newChat } = require('./controller');

const router = express.Router();

router.get('/', getAllChats); // for GET
router.post('/', newChat); // for POST

module.exports = router;