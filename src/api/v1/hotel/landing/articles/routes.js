const express = require('express');
const { getLandingArticles, createLandingArticle } = require('./controller');
const router = express.Router();

router.get('/', getLandingArticles);
router.post('/', createLandingArticle);

module.exports = router;