const pronosticService = require('../services/pronosticService');

const list = async (req, res, next) => {
  try { res.json(await pronosticService.getPronostics()); }
  catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const prono = await pronosticService.createPronostic({ ...req.body, userId: req.user.id });
    res.status(201).json(prono);
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const prono = await pronosticService.updatePronostic(req.params.id, req.body);
    res.json(prono);
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    await pronosticService.deletePronostic(req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
};

module.exports = { list, create, update, remove };
