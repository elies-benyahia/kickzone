const router = require('express').Router();
const { fetchAllArticles } = require('../services/rssService');

// Dernières actus agrégées depuis les flux RSS.
router.get('/latest', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const articles = await fetchAllArticles();
    res.json(articles.slice(0, limit));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
