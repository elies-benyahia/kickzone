const router = require('express').Router();
const { fetchAllArticles } = require('../services/rssService');

router.get('/latest', async (req, res, next) => {
  try {
    const articles = await fetchAllArticles();
    const limit = parseInt(req.query.limit) || 30;
    res.json(articles.slice(0, limit));
  } catch (err) {
    next(err);
  }
});

router.get('/category/:cat', async (req, res, next) => {
  try {
    const { cat } = req.params;
    const KEYWORDS = {
      transfert: ['transfert', 'mercato', 'signe', 'recrute', 'deal', 'accord', 'million'],
      resultats: ['victoire', 'défaite', 'score', 'but', 'gagne', 'battu', 'résultat'],
      ucl: ['champions league', 'ligue des champions', 'ucl'],
      coupe: ['coupe du monde', 'world cup', 'mondial'],
    };
    const kws = KEYWORDS[cat.toLowerCase()] || [cat.toLowerCase()];
    const articles = await fetchAllArticles();
    const filtered = articles.filter((a) => {
      const text = `${a.title} ${a.summary}`.toLowerCase();
      return kws.some((kw) => text.includes(kw));
    });
    res.json(filtered.slice(0, 20));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
