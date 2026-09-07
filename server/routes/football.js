// ============================================================================
//  routes/football.js — URL des données football -> contrôleur
//  Toutes ces routes sont publiques (pas d'authentification).
//  IMPORTANT : les routes fixes (ex /fixtures/today) doivent être déclarées
//  AVANT les routes à paramètre (ex /fixtures/:id), sinon "today" serait pris
//  pour un identifiant.
// ============================================================================

const router = require('express').Router();
const c = require('../controllers/footballController');

// --- Matchs ---
router.get('/fixtures/today',       c.today);   // matchs du jour
router.get('/fixtures/date/:date',  c.byDate);  // matchs d'une date (YYYY-MM-DD)
router.get('/fixtures/:id/lineups', c.lineups); // compositions d'un match
router.get('/fixtures/:id/stats',   c.stats);   // statistiques d'un match
router.get('/fixtures/:id/events',  c.events);  // événements (buts, cartons)
router.get('/fixtures/:id',         c.fixture); // détail d'un match

// --- Confrontations & classements ---
router.get('/h2h/:team1/:team2', c.h2h);        // face-à-face entre 2 équipes
router.get('/standings/:league', c.standings);  // classement d'une compétition

// --- Transferts & actus mercato ---
router.get('/transfers/news',  c.transferNews); // brèves mercato depuis les flux RSS
router.get('/transfers/:team', c.transfers);    // transferts d'une équipe

// --- Recherche ---
router.get('/search',         c.search);        // recherche globale (joueurs + équipes)
router.get('/players/search', c.playerSearch);  // recherche de joueurs
router.get('/players/:id',    c.player);        // fiche d'un joueur

// --- Équipes ---
router.get('/teams/search',         c.teamSearch); // (avant /teams/:id)
router.get('/teams/:id/statistics', c.teamStats);
router.get('/teams/:id/squad',      c.teamSquad);
router.get('/teams/:id',            c.team);

module.exports = router;
