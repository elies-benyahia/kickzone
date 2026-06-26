const axios = require('axios');

const API_BASE = 'https://v3.football.api-sports.io';
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;
const STANDINGS_TTL = 30 * 60 * 1000;

const apiCall = async (endpoint, params = {}) => {
  const cacheKey = endpoint + JSON.stringify(params);
  const ttl = endpoint.includes('standings') ? STANDINGS_TTL : CACHE_TTL;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < ttl) return cached.data;

  console.log(`[API-Football] ${new Date().toISOString()} GET ${endpoint}`, params);
  const { data } = await axios.get(`${API_BASE}${endpoint}`, {
    headers: { 'x-apisports-key': process.env.FOOTBALL_API_KEY },
    params,
    timeout: 10000,
  });

  const result = data.response;
  cache.set(cacheKey, { data: result, ts: Date.now() });
  return result;
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
  getH2H: (team1, team2) => apiCall('/fixtures/headtohead', { h2h: `${team1}-${team2}`, last: 5 }),
  getStandings: (leagueId) => apiCall('/standings', { league: leagueId, season: 2024 }),
  getTransfers: (teamId) => apiCall('/transfers', { team: teamId }),
  getLatestTransfers: async () => {
    const teams = [85, 50, 541, 157, 496]; // PSG, Man City, Real Madrid, Bayern, Juventus
    const results = await Promise.all(teams.map(id => apiCall('/transfers', { team: id })));
    return results.flat().slice(0, 20);
  },
  getPlayers: (teamId) => apiCall('/players', { team: teamId, season: 2024 }),
  searchPlayers: (name) => apiCall('/players', { search: name, season: 2024 }),
  getPlayer: (id) => apiCall('/players', { id, season: 2024 }),
  getPlayerTransfers: (id) => apiCall('/transfers', { player: id }),
  getPlayerTrophies: (id) => apiCall('/trophies', { player: id }),
};
