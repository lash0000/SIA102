const express = require('express');
const { getActivityLogs, getActivityLogById, addActivity } = require('./controller');

const router = express.Router();

router.get('/', getActivityLogs);
router.get('/:id', getActivityLogById);
router.post('/', addActivity);

module.exports = router;