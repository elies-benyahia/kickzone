// ============================================================================
//  controllers/footballController.js
//  Toutes les routes /api/football sont de simples "passe-plats" :
//  lire un paramètre d'URL -> appeler le service -> renvoyer le JSON.
//  Le helper `wrap` évite de réécrire le try/catch à chaque fois.
// ============================================================================

const fb = require('../services/footballService');
const { fetchTransferNews } = require('../services/rssService');

// Transforme une fonction "async (req) => données" en handler Express complet
// (envoi du JSON + transmission des erreurs au gestionnaire central).
const wrap = (fn) => async (req, res, next) => {
  try { res.json(await fn(req)); }
  catch (e) { next(e); }
};

module.exports = {
  today:        wrap(() => fb.getFixturesToday()),                              // /fixtures/today
  byDate:       wrap((req) => fb.getFixturesByDate(req.params.date)),           // /fixtures/date/:date
  fixture:      wrap((req) => fb.getFixtureById(req.params.id)),                // /fixtures/:id
  lineups:      wrap((req) => fb.getLineups(req.params.id)),                    // /fixtures/:id/lineups
  stats:        wrap((req) => fb.getStats(req.params.id)),                      // /fixtures/:id/stats
  events:       wrap((req) => fb.getEvents(req.params.id)),                     // /fixtures/:id/events
  h2h:          wrap((req) => fb.getH2H(req.params.team1, req.params.team2)),   // /h2h/:t1/:t2
  standings:    wrap((req) => fb.getStandings(req.params.league)),             // /standings/:league
  transfers:    wrap((req) => fb.getTransfers(req.params.team)),               // /transfers/:team
  transferNews: wrap(() => fetchTransferNews()),                               // /transfers/news (flux RSS)
  team:         wrap((req) => fb.getTeam(req.params.id)),                       // /teams/:id
  teamStats:    wrap((req) => fb.getTeamStatistics(req.params.id, req.query.league)),
  teamSquad:    wrap((req) => fb.getTeamSquad(req.params.id)),                 // /teams/:id/squad
  teamSearch:   wrap((req) => fb.searchTeams(req.query.q || '')),             // /teams/search?q=
  playerSearch: wrap((req) => fb.searchPlayers(req.query.q || '')),           // /players/search?q=
  player:       wrap((req) => fb.getPlayerFull(req.params.id)),                // /players/:id
  search:       wrap((req) => fb.search(req.query.q)),                         // /search?q=
};
