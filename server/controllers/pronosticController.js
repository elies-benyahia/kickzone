// controllers/pronosticController.js — pronostics.

const pronosticService = require('../services/pronosticService');

const list = async (req, res, next) => {
  try { res.json(await pronosticService.getPronostics()); }
  catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    // on ajoute l'id de l'auteur (req.user rempli par authenticate)
    res.status(201).json(await pronosticService.createPronostic({ ...req.body, userId: req.user?.id ?? null }));
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try { res.json(await pronosticService.updatePronostic(req.params.id, req.body)); }
  catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try { await pronosticService.deletePronostic(req.params.id); res.status(204).end(); }
  catch (e) { next(e); }
};

module.exports = { list, create, update, remove };
