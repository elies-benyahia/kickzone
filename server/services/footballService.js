// ============================================================================
//  services/footballService.js — accès à l'API-Football (api-sports.io)
//  Le serveur sert d'intermédiaire ("proxy") entre le front et l'API externe :
//   - il ajoute la clé secrète FOOTBALL_API_KEY (jamais exposée au navigateur)
//   - il met les réponses en cache 5 min (voir cacheService)
//   - si la clé n'est pas configurée, il renvoie [] au lieu de planter
// ============================================================================

const axios = require('axios'); // client HTTP pour appeler l'API externe
const { getFromCache, setInCache } = require('./cacheService');

const API_BASE = 'https://v3.football.api-sports.io';

// Saison en cours au sens API-Football (on donne l'année de début).
// Ex : en septembre 2026 -> saison 2026 (= 2026/2027).
const season = () => {
  const now = new Date();
  return now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
};

// Appel générique à l'API-Football.
//  endpoint : ex "/standings"      params : ex { league: 2, season: 2026 }
const call = async (endpoint, params = {}) => {
  const key = endpoint + JSON.stringify(params); // clé de cache = URL + paramètres

  const cached = getFromCache(key);
  if (cached !== null) return cached;            // déjà en cache -> on renvoie tout de suite

  // Pas de clé API : on renvoie [] (le site reste fonctionnel, pages "aucune donnée").
  if (!process.env.FOOTBALL_API_KEY && process.env.NODE_ENV !== 'test') return [];

  try {
    const { data } = await axios.get(`${API_BASE}${endpoint}`, {
      headers: { 'x-apisports-key': process.env.FOOTBALL_API_KEY },
      params,
      timeout: 10000, // abandon au bout de 10 s
    });
    const result = data.response ?? []; // l'API renvoie { response: [...] }
    setInCache(key, result);
    return result;
  } catch (e) {
    console.error(`[API-FOOTBALL] ${endpoint} : ${e.message}`);
    return []; // en cas d'erreur réseau, on renvoie [] plutôt que de planter
  }
};

const today = () => new Date().toISOString().split('T')[0]; // "2026-09-08"

// Chaque méthode = un endpoint de l'API-Football.
module.exports = {
  getFixturesToday:  () => call('/fixtures', { date: today(), timezone: 'Europe/Paris' }),
  getFixturesByDate: (date) => call('/fixtures', { date, timezone: 'Europe/Paris' }),
  getFixtureById:    (id) => call('/fixtures', { id }),
  getLineups:        (id) => call('/fixtures/lineups', { fixture: id }),   // compositions
  getStats:          (id) => call('/fixtures/statistics', { fixture: id }),// stats du match
  getEvents:         (id) => call('/fixtures/events', { fixture: id }),    // buts, cartons...
  getH2H:            (t1, t2) => call('/fixtures/headtohead', { h2h: `${t1}-${t2}`, last: 10 }), // confrontations
  getStandings:      (league) => call('/standings', { league, season: season() }),               // classement
  getTransfers:      (team) => call('/transfers', { team }),
  getTeam:           (id) => call('/teams', { id }),
  getTeamStatistics: (team, league = 61) => call('/teams/statistics', { team, league, season: season() }),
  getTeamSquad:      (team) => call('/players/squads', { team }),          // effectif
  searchPlayers:     (name) => call('/players', { search: name, season: season() }),
  searchTeams:       (name) => call('/teams', { search: name }),

  // Recherche globale : joueurs + équipes (les 5 premiers de chaque).
  // Les deux appels partent en parallèle (Promise.all).
  search: async (q) => {
    if (!q || q.length < 2) return { players: [], teams: [] };
    const [players, teams] = await Promise.all([
      call('/players', { search: q, season: season() }),
      call('/teams', { search: q }),
    ]);
    return { players: players.slice(0, 5), teams: teams.slice(0, 5) };
  },

  // Fiche complète d'un joueur : profil + historique des transferts + palmarès.
  getPlayerFull: async (id) => {
    const [player, transfers, trophies] = await Promise.all([
      call('/players', { id, season: season() }),
      call('/transfers', { player: id }),
      call('/trophies', { player: id }),
    ]);
    return { player: player[0] ?? null, transfers, trophies };
  },
};
