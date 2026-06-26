const router = require('express').Router();
const c = require('../controllers/footballController');
const { fetchTransferNews } = require('../services/rssService');

router.get('/fixtures/today',           c.today);
router.get('/fixtures/date/:date',      c.byDate);
router.get('/fixtures/:id/lineups',     c.lineups);
router.get('/fixtures/:id/stats',       c.stats);
router.get('/fixtures/:id',             c.fixture);
router.get('/h2h/:team1/:team2',        c.h2h);
router.get('/standings/:league',        c.standings);
router.get('/transfers/latest',         c.latestTransfers);

router.get('/transfers/news', async (req, res, next) => {
  try {
    const news = await fetchTransferNews();
    res.json(news);
  } catch (e) { next(e); }
});

router.get('/players/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);
    const results = await require('../services/footballService').searchPlayers(q);
    res.json(results);
  } catch (e) { next(e); }
});

router.get('/players/:id', async (req, res, next) => {
  try {
    const fs = require('../services/footballService');
    const [player, transfers, trophies] = await Promise.allSettled([
      fs.getPlayer(req.params.id),
      fs.getPlayerTransfers(req.params.id),
      fs.getPlayerTrophies(req.params.id),
    ]);
    res.json({
      player: player.value?.[0] ?? null,
      transfers: transfers.value ?? [],
      trophies: trophies.value ?? [],
    });
  } catch (e) { next(e); }
});

router.get('/transfers/:team',          c.transfers);

module.exports = router;
