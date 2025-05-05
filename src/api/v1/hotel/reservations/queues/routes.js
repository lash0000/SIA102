const express = require('express');
const { 
    getAllBookQueue, getBookQueueByGuestId, createBookQueue, updateBookQueue, deleteBookQueue
} = require("./controller");

const router = express.Router();

router.get('/', getAllBookQueue);
router.get('/:id', getBookQueueByGuestId);
router.post('/', createBookQueue);
router.put('/:id', updateBookQueue);
router.delete('/:id', deleteBookQueue);

module.exports = router;