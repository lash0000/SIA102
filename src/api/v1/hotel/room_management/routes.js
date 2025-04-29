/*
*   This feature is for Room Management
*/

const express = require('express');
const { getRooms, getRoomsById, createRoom, updateRoomById } = require('./controller');

const router = express.Router();

router.get('/', getRooms);
router.get('/:id', getRoomsById);
router.post('/', createRoom);
router.put('/:id', updateRoomById);
// router.put('/:id', updateRecord);

module.exports = router;