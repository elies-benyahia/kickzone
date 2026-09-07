const axios = require('axios');
const { getFromCache, setInCache, TTL } = require('./cacheService');

const API_BASE = 'https://v3.football.api-sports.io';

// Saison en cours au sens API-Football (année de début).
// Ex. : en septembre 2026 -> saison 2026 (2026/2027).
const currentSeason = () => {
  const now = new Date();
  return now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
};

const getTTL = (endpoint) => {
  if (endpoint.includes('fixtures') && !endpoint.includes('lineups') && !endpoint.includes('statistics') && !endpoint.includes('headtohead') && !endpoint.includes('events')) {
    return TTL.FIXTURES;
  }
  if (endpoint.includes('standings')) return TTL.STANDINGS;
  if (endpoint.includes('lineups') || endpoint.includes('headtohead')) return TTL.LINEUPS;
  if (endpoint.includes('transfers')) return TTL.TRANSFERS;
  if (endpoint.includes('players') || endpoint.includes('trophies')) return TTL.PLAYERS;
  return TTL.DEFAULT;
};

const apiCall = async (endpoint, params = {}) => {
  const cacheKey = endpoint + JSON.stringify(params);
  const ttl = getTTL(endpoint);

  const cached = getFromCache(cacheKey);
  if (cached !== null) return cached;

  // Pas de clé API configurée : on renvoie un résultat vide plutôt que planter.
  if (!process.env.FOOTBALL_API_KEY && process.env.NODE_ENV !== 'test') {
    console.warn(`[API-FOOTBALL] FOOTBALL_API_KEY manquant — ${endpoint} renvoie []`);
    return [];
  }

  console.log(`[API-FOOTBALL] ${new Date().toISOString()} GET ${endpoint}`, params);
  try {
    const { data } = await axios.get(`${API_BASE}${endpoint}`, {
      headers: { 'x-apisports-key': process.env.FOOTBALL_API_KEY },
      params,
      timeout: 10000,
    });
    const result = data.response ?? [];
    setInCache(cacheKey, result, ttl);
    return result;
  } catch (e) {
    console.error(`[API-FOOTBALL] Erreur ${endpoint} : ${e.message}`);
    return [];
  }
};

module.exports = {
  getFixturesToday: () => {
    const date = new Date().toISOString().split('T')[0];
    return apiCall('/fixtures', { date, timezone: 'Europe/Paris' });
  },
  getFixturesByDate: (date) => apiCall('/fixtures', { date, timezone: 'Europe/Paris' }),
  getFixtureById: (id) => apiCall('/fixtures', { id }),
  getLineups: (fixtureId) => apiCall('/fixtures/lineups', { fixture: fixtureId }),
  getStats: (fixtureId) => apiCall('/fixtures/statistics', { fixture: fixtureId }),
  getEvents: (fixtureId) => apiCall('/fixtures/events', { fixture: fixtureId }),
  getH2H: (team1, team2) => apiCall('/fixtures/headtohead', { h2h: `${team1}-${team2}`, last: 10 }),
  getStandings: (leagueId) => apiCall('/standings', { league: leagueId, season: currentSeason() }),
  getTransfers: (teamId) => apiCall('/transfers', { team: teamId }),
  getLatestTransfers: async () => {
    const teams = [85, 50, 541, 157, 496, 40, 529, 489];
    const results = await Promise.all(teams.map(id => apiCall('/transfers', { team: id })));
    return results.flat().slice(0, 20);
  },
  getTeam: (id) => apiCall('/teams', { id }),
  getTeamStatistics: (teamId, leagueId = 61, season = 2024) =>
    apiCall('/teams/statistics', { team: teamId, league: leagueId, season }),
  getTeamSquad: (teamId) => apiCall('/players/squads', { team: teamId }),
  getPlayers: (teamId) => apiCall('/players', { team: teamId, season: 2024 }),
  searchPlayers: (name) => apiCall('/players', { search: name, season: 2024 }),
  searchTeams: (name) => apiCall('/teams', { search: name }),
  getPlayer: (id) => apiCall('/players', { id, season: 2024 }),
  getPlayerTransfers: (id) => apiCall('/transfers', { player: id }),
  getPlayerTrophies: (id) => apiCall('/trophies', { player: id }),
};
