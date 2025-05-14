const express = require('express');
const { getHomeLandingPage, createHomeLandingPage } = require('./controller');
const router = express.Router();

router.get('/', getHomeLandingPage);
router.post('/', createHomeLandingPage);

module.exports = router;