const router = require('express').Router();
const c = require('../controllers/footballController');
const fs = require('../services/footballService');
const { fetchTransferNews } = require('../services/rssService');
const { getFromCache, setInCache, TTL } = require('../services/cacheService');
const axios = require('axios');

const API_BASE = 'https://v3.football.api-sports.io';
const apiHeaders = () => ({ 'x-apisports-key': process.env.FOOTBALL_API_KEY });

// Routes spécifiques EN PREMIER (avant les routes paramétriques :id)
router.get('/fixtures/today',        c.today);
router.get('/fixtures/date/:date',   c.byDate);

// Coupe du Monde 2026 — DOIT être avant /fixtures/:id
router.get('/fixtures/worldcup', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `wc:${today}`;
    const cached = getFromCache(cacheKey);
    if (cached) return res.json(cached);

    console.log(`[API-FOOTBALL] GET /fixtures/worldcup date=${today}`);
    const { data } = await axios.get(`${API_BASE}/fixtures`, {
      headers: apiHeaders(),
      params: { league: 1, season: 2026, date: today },
      timeout: 10000,
    });
    let result = data.response ?? [];

    if (result.length === 0) {
      const { data: next } = await axios.get(`${API_BASE}/fixtures`, {
        headers: apiHeaders(),
        params: { league: 1, season: 2026, next: 8 },
        timeout: 10000,
      });
      result = next.response ?? [];
    }

    setInCache(cacheKey, result, 60);
    res.json(result);
  } catch (e) { next(e); }
});

router.get('/fixtures/:id/lineups',  c.lineups);
router.get('/fixtures/:id/stats',    c.stats);
router.get('/fixtures/:id/events',   c.events);
router.get('/fixtures/:id',          c.fixture);

router.get('/h2h/:team1/:team2',     c.h2h);
router.get('/standings/:league',     c.standings);

router.get('/transfers/news', async (req, res, next) => {
  try { res.json(await fetchTransferNews()); }
  catch (e) { next(e); }
});

// Derniers transferts 2026 depuis l'API
router.get('/transfers/latest', async (req, res, next) => {
  try {
    const cacheKey = 'transfers:latest:2026';
    const cached = getFromCache(cacheKey);
    if (cached) return res.json(cached);

    const teamIds = [85, 50, 541, 40, 529];
    console.log(`[API-FOOTBALL] GET /transfers/latest (${teamIds.length} clubs)`);

    const results = await Promise.allSettled(
      teamIds.map(id =>
        axios.get(`${API_BASE}/transfers`, {
          params: { team: id },
          headers: apiHeaders(),
          timeout: 10000,
        })
      )
    );

    const transfers = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value.data.response ?? [])
      .filter(t => {
        const year = new Date(t.transfers?.[0]?.date).getFullYear();
        return year >= 2026;
      })
      .sort((a, b) => new Date(b.transfers?.[0]?.date) - new Date(a.transfers?.[0]?.date))
      .slice(0, 20);

    setInCache(cacheKey, transfers, TTL.TRANSFERS);
    res.json(transfers);
  } catch (e) { next(e); }
});

router.get('/transfers/:team', c.transfers);

// Recherche globale (joueurs + équipes)
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ players: [], teams: [] });

    const cacheKey = `search:${q.toLowerCase()}`;
    const cached = getFromCache(cacheKey);
    if (cached) return res.json(cached);

    console.log(`[API-FOOTBALL] GET /search q="${q}"`);
    const [players, teams] = await Promise.allSettled([
      fs.searchPlayers(q),
      fs.searchTeams(q),
    ]);

    const result = {
      players: (players.value ?? []).slice(0, 5),
      teams:   (teams.value   ?? []).slice(0, 5),
    };

    setInCache(cacheKey, result, TTL.DEFAULT);
    res.json(result);
  } catch (e) { next(e); }
});

router.get('/players/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);
    res.json(await fs.searchPlayers(q));
  } catch (e) { next(e); }
});

router.get('/players/:id', async (req, res, next) => {
  try {
    const [player, transfers, trophies] = await Promise.allSettled([
      fs.getPlayer(req.params.id),
      fs.getPlayerTransfers(req.params.id),
      fs.getPlayerTrophies(req.params.id),
    ]);
    res.json({
      player:    player.value?.[0] ?? null,
      transfers: transfers.value   ?? [],
      trophies:  trophies.value    ?? [],
    });
  } catch (e) { next(e); }
});

// /teams/search AVANT /teams/:id
router.get('/teams/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);
    res.json(await fs.searchTeams(q));
  } catch (e) { next(e); }
});
router.get('/teams/:id/statistics', c.teamStats);
router.get('/teams/:id/squad',      c.teamSquad);
router.get('/teams/:id',            c.team);

module.exports = router;
