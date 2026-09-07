// ============================================================================
//  controllers/pronosticController.js — pronostics
// ============================================================================

const pronosticService = require('../services/pronosticService');

// GET /api/pronostics -> liste complète
const list = async (req, res, next) => {
  try { res.json(await pronosticService.getPronostics()); }
  catch (e) { next(e); }
};

// POST /api/pronostics -> création. On ajoute l'id de l'auteur (req.user rempli par authenticate).
const create = async (req, res, next) => {
  try {
    const prono = await pronosticService.createPronostic({ ...req.body, userId: req.user?.id ?? null });
    res.status(201).json(prono);
  } catch (e) { next(e); }
};

// PUT /api/pronostics/:id -> mise à jour (résultat CORRECT / RATE, confiance...)
const update = async (req, res, next) => {
  try {
    const prono = await pronosticService.updatePronostic(req.params.id, req.body);
    res.json(prono);
  } catch (e) { next(e); }
};

// DELETE /api/pronostics/:id
const remove = async (req, res, next) => {
  try {
    await pronosticService.deletePronostic(req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
};

module.exports = { list, create, update, remove };
