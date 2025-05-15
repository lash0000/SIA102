const express = require('express');
const { getHomeLandingPage, getArticleById, createHomeLandingPage, updateHomeLandingPage } = require('./controller');
const router = express.Router();

router.get('/', getHomeLandingPage);
router.get('/article/:id', getArticleById);
router.post('/', createHomeLandingPage);
router.put('/:id', updateHomeLandingPage);

module.exports = router;