// ============================================================================
//  routes/news.js — actualités football agrégées depuis des flux RSS
//  (L'Équipe, Foot Mercato, RMC...). Voir services/rssService.js.
// ============================================================================

const router = require('express').Router();
const { fetchAllArticles } = require('../services/rssService');

// GET /api/news/latest?limit=30 -> les dernières actus, triées par date.
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
