const express = require('express');
const { getLandingArticles, createLandingArticle, updateLandingArticle } = require('./controller');
const router = express.Router();

router.get('/', getLandingArticles);
router.post('/', createLandingArticle);
router.put('/:id', updateLandingArticle);

module.exports = router;