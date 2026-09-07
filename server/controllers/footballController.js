const fb = require('../services/footballService');
const { fetchTransferNews } = require('../services/rssService');

// Transforme une fonction async (req -> data) en handler Express.
const wrap = (fn) => async (req, res, next) => {
  try { res.json(await fn(req)); }
  catch (e) { next(e); }
};

module.exports = {
  today:        wrap(() => fb.getFixturesToday()),
  byDate:       wrap((req) => fb.getFixturesByDate(req.params.date)),
  fixture:      wrap((req) => fb.getFixtureById(req.params.id)),
  lineups:      wrap((req) => fb.getLineups(req.params.id)),
  stats:        wrap((req) => fb.getStats(req.params.id)),
  events:       wrap((req) => fb.getEvents(req.params.id)),
  h2h:          wrap((req) => fb.getH2H(req.params.team1, req.params.team2)),
  standings:    wrap((req) => fb.getStandings(req.params.league)),
  transfers:    wrap((req) => fb.getTransfers(req.params.team)),
  transferNews: wrap(() => fetchTransferNews()),
  team:         wrap((req) => fb.getTeam(req.params.id)),
  teamStats:    wrap((req) => fb.getTeamStatistics(req.params.id, req.query.league)),
  teamSquad:    wrap((req) => fb.getTeamSquad(req.params.id)),
  teamSearch:   wrap((req) => fb.searchTeams(req.query.q || '')),
  playerSearch: wrap((req) => fb.searchPlayers(req.query.q || '')),
  player:       wrap((req) => fb.getPlayerFull(req.params.id)),
  search:       wrap((req) => fb.search(req.query.q)),
};
