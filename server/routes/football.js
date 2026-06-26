const router = require('express').Router();
const c = require('../controllers/footballController');

router.get('/fixtures/today',           c.today);
router.get('/fixtures/date/:date',      c.byDate);
router.get('/fixtures/:id/lineups',     c.lineups);
router.get('/fixtures/:id/stats',       c.stats);
router.get('/fixtures/:id',             c.fixture);
router.get('/h2h/:team1/:team2',        c.h2h);
router.get('/standings/:league',        c.standings);
router.get('/transfers/latest',         c.latestTransfers);
router.get('/transfers/:team',          c.transfers);

module.exports = router;
