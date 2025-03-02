/*
*   This feature is for Room Management
*/

const express = require('express');
const { getRooms, createRoom } = require('./controller');

const router = express.Router();

router.get('/', getRooms);
router.post('/', createRoom);
// router.put('/:id', updateRecord);

module.exports = router;