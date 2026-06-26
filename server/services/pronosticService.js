const prisma = require('./prismaClient');

const getPronostics = async () =>
  prisma.pronostic.findMany({ orderBy: { matchDate: 'desc' }, include: { user: { select: { email: true } } } });

const createPronostic = async ({ fixtureId, homeTeam, awayTeam, prediction, confidence, league, matchDate, userId }) =>
  prisma.pronostic.create({
    data: { fixtureId: Number(fixtureId), homeTeam, awayTeam, prediction, confidence: Number(confidence), league, matchDate: new Date(matchDate), userId: Number(userId) },
  });

const updatePronostic = async (id, fields) =>
  prisma.pronostic.update({ where: { id: Number(id) }, data: fields });

const deletePronostic = async (id) =>
  prisma.pronostic.delete({ where: { id: Number(id) } });

module.exports = { getPronostics, createPronostic, updatePronostic, deletePronostic };
