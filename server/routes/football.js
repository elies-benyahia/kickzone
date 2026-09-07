// routes/football.js — URL des données football -> contrôleur. Toutes publiques.
// Routes fixes AVANT les routes à paramètre (sinon "today" serait pris pour un id).

const router = require('express').Router();
const c = require('../controllers/footballController');

// Matchs
router.get('/fixtures/today',       c.today);
router.get('/fixtures/date/:date',  c.byDate);
router.get('/fixtures/:id/lineups', c.lineups);
router.get('/fixtures/:id/stats',   c.stats);
router.get('/fixtures/:id/events',  c.events);
router.get('/fixtures/:id',         c.fixture);

// Confrontations & classements
router.get('/h2h/:team1/:team2', c.h2h);
router.get('/standings/:league', c.standings);

// Transferts & actus mercato
router.get('/transfers/news',  c.transferNews);
router.get('/transfers/:team', c.transfers);

// Recherche
router.get('/search',         c.search);
router.get('/players/search', c.playerSearch);
router.get('/players/:id',    c.player);

// Équipes
router.get('/teams/search',         c.teamSearch);
router.get('/teams/:id/statistics', c.teamStats);
router.get('/teams/:id/squad',      c.teamSquad);
router.get('/teams/:id',            c.team);

module.exports = router;
