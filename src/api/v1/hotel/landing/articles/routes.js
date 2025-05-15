const express = require('express');
const { getLandingArticles, getArticleById, createLandingArticle, updateLandingArticle } = require('./controller');
const router = express.Router();

router.get('/', getLandingArticles);
router.get('/article/:id', getArticleById);
router.post('/', createLandingArticle);
router.put('/:id', updateLandingArticle);

module.exports = router;