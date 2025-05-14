const express = require('express');
const { getLandingPageFAQs, createLandingPageFAQs } = require('./controller');
const router = express.Router();

router.get('/', getLandingPageFAQs);
router.post('/', createLandingPageFAQs);

module.exports = router;