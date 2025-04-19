/*
 *   This feature is for JWT-based login sessions tracking (HRIS)
 */

const express = require('express');
const { login, getAllSessions } = require('./controller');

const router = express.Router();

// POST: Login route
router.post('/login', login);

// GET: All login sessions
router.get('/sessions', getAllSessions);

module.exports = router;