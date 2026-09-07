const axios = require('axios');
const { getFromCache, setInCache } = require('./cacheService');

const API_BASE = 'https://v3.football.api-sports.io';

// Saison en cours au sens API-Football (année de début).
// Ex. : en septembre 2026 -> saison 2026 (2026/2027).
const season = () => {
  const now = new Date();
  return now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
};

// Appel générique à l'API-Football, avec cache 5 min.
// Sans clé API configurée, renvoie [] plutôt que de planter.
const call = async (endpoint, params = {}) => {
  const key = endpoint + JSON.stringify(params);

  const cached = getFromCache(key);
  if (cached !== null) return cached;

  if (!process.env.FOOTBALL_API_KEY && process.env.NODE_ENV !== 'test') return [];

  try {
    const { data } = await axios.get(`${API_BASE}${endpoint}`, {
      headers: { 'x-apisports-key': process.env.FOOTBALL_API_KEY },
      params,
      timeout: 10000,
    });
    const result = data.response ?? [];
    setInCache(key, result);
    return result;
  } catch (e) {
    console.error(`[API-FOOTBALL] ${endpoint} : ${e.message}`);
    return [];
  }
};

const today = () => new Date().toISOString().split('T')[0];

module.exports = {
  getFixturesToday:   () => call('/fixtures', { date: today(), timezone: 'Europe/Paris' }),
  getFixturesByDate:  (date) => call('/fixtures', { date, timezone: 'Europe/Paris' }),
  getFixtureById:     (id) => call('/fixtures', { id }),
  getLineups:         (id) => call('/fixtures/lineups', { fixture: id }),
  getStats:           (id) => call('/fixtures/statistics', { fixture: id }),
  getEvents:          (id) => call('/fixtures/events', { fixture: id }),
  getH2H:             (t1, t2) => call('/fixtures/headtohead', { h2h: `${t1}-${t2}`, last: 10 }),
  getStandings:       (league) => call('/standings', { league, season: season() }),
  getTransfers:       (team) => call('/transfers', { team }),
  getTeam:            (id) => call('/teams', { id }),
  getTeamStatistics:  (team, league = 61) => call('/teams/statistics', { team, league, season: season() }),
  getTeamSquad:       (team) => call('/players/squads', { team }),
  searchPlayers:      (name) => call('/players', { search: name, season: season() }),
  searchTeams:        (name) => call('/teams', { search: name }),

  // Recherche globale : joueurs + équipes (5 max chacun)
  search: async (q) => {
    if (!q || q.length < 2) return { players: [], teams: [] };
    const [players, teams] = await Promise.all([
      call('/players', { search: q, season: season() }),
      call('/teams', { search: q }),
    ]);
    return { players: players.slice(0, 5), teams: teams.slice(0, 5) };
  },

  // Fiche joueur complète
  getPlayerFull: async (id) => {
    const [player, transfers, trophies] = await Promise.all([
      call('/players', { id, season: season() }),
      call('/transfers', { player: id }),
      call('/trophies', { player: id }),
    ]);
    return { player: player[0] ?? null, transfers, trophies };
  },
};
