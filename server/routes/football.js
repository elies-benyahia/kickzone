const router = require('express').Router();
const c = require('../controllers/footballController');

// Routes fixes AVANT les routes paramétriques (/:id)
router.get('/fixtures/today',      c.today);
router.get('/fixtures/date/:date', c.byDate);
router.get('/fixtures/:id/lineups', c.lineups);
router.get('/fixtures/:id/stats',  c.stats);
router.get('/fixtures/:id/events', c.events);
router.get('/fixtures/:id',        c.fixture);

router.get('/h2h/:team1/:team2', c.h2h);
router.get('/standings/:league', c.standings);

router.get('/transfers/news',  c.transferNews);
router.get('/transfers/:team', c.transfers);

router.get('/search',          c.search);
router.get('/players/search',  c.playerSearch);
router.get('/players/:id',     c.player);

router.get('/teams/search',        c.teamSearch);
router.get('/teams/:id/statistics', c.teamStats);
router.get('/teams/:id/squad',      c.teamSquad);
router.get('/teams/:id',            c.team);

module.exports = router;
