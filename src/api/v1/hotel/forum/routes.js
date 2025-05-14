/*
*   This feature is for forum scenario.
*/

const express = require('express');
const { createMainThread, getMainThreads, addComment, getThreadById } = require('./controller');

const router = express.Router();

router.get('/', getMainThreads); // GET all data
router.get('/:id', getThreadById); // GET a specific data by ID
router.post('/add-thread', createMainThread);
router.post('/user-comment', addComment); // For sub-thread of forum.

module.exports = router;