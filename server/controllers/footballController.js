const footballService = require('../services/footballService');

const wrap = (fn) => async (req, res, next) => {
  try { res.json(await fn(req, res)); }
  catch (e) { next(e); }
};

module.exports = {
  today:      wrap((req) => footballService.getFixturesToday()),
  byDate:     wrap((req) => footballService.getFixturesByDate(req.params.date)),
  fixture:    wrap((req) => footballService.getFixtureById(req.params.id)),
  lineups:    wrap((req) => footballService.getLineups(req.params.id)),
  stats:      wrap((req) => footballService.getStats(req.params.id)),
  h2h:        wrap((req) => footballService.getH2H(req.params.team1, req.params.team2)),
  standings:  wrap((req) => footballService.getStandings(req.params.league)),
  transfers:  wrap((req) => footballService.getTransfers(req.params.team)),
  latestTransfers: wrap(() => footballService.getLatestTransfers()),
};
