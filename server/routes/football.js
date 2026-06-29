const router = require('express').Router();
const c = require('../controllers/footballController');
const fs = require('../services/footballService');
const { fetchTransferNews } = require('../services/rssService');

router.get('/fixtures/today',              c.today);
router.get('/fixtures/date/:date',         c.byDate);
router.get('/fixtures/:id/lineups',        c.lineups);
router.get('/fixtures/:id/stats',          c.stats);
router.get('/fixtures/:id/events',         c.events);
router.get('/fixtures/:id',                c.fixture);

router.get('/h2h/:team1/:team2',           c.h2h);
router.get('/standings/:league',           c.standings);

router.get('/transfers/news', async (req, res, next) => {
  try { res.json(await fetchTransferNews()); }
  catch (e) { next(e); }
});
router.get('/transfers/latest',            c.latestTransfers);
router.get('/transfers/:team',             c.transfers);

router.get('/players/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);
    res.json(await fs.searchPlayers(q));
  } catch (e) { next(e); }
});
router.get('/players/:id',                 async (req, res, next) => {
  try {
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

router.get('/teams/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);
    res.json(await fs.searchTeams(q));
  } catch (e) { next(e); }
});
router.get('/teams/:id/statistics',        c.teamStats);
router.get('/teams/:id/squad',             c.teamSquad);
router.get('/teams/:id',                   c.team);

router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ players: [], teams: [] });
    const [players, teams] = await Promise.allSettled([
      fs.searchPlayers(q),
      fs.searchTeams(q),
    ]);
    res.json({
      players: (players.value ?? []).slice(0, 5),
      teams: (teams.value ?? []).slice(0, 5),
    });
  } catch (e) { next(e); }
});

module.exports = router;
