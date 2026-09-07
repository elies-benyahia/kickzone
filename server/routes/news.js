// routes/news.js — actus football agrégées depuis des flux RSS (voir services/rssService.js).

const router = require('express').Router();
const { fetchAllArticles } = require('../services/rssService');

router.get('/latest', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const articles = await fetchAllArticles();
    res.json(articles.slice(0, limit));
  } catch (err) { next(err); }
});

module.exports = router;
