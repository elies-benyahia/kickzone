// controllers/articleController.js — lit la requête, appelle le service, renvoie le JSON.
// En cas d'erreur : next(e) -> gestionnaire central dans index.js.

const articleService = require('../services/articleService');

const list = async (req, res, next) => {
  try { res.json(await articleService.getArticles(req.query)); } // { category, page, limit }
  catch (e) { next(e); }
};

const get = async (req, res, next) => {
  try { res.json(await articleService.getArticleBySlug(req.params.slug)); } // + 1 vue
  catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try { res.status(201).json(await articleService.createArticle(req.body)); } // 201 = créé
  catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try { res.json(await articleService.updateArticle(req.params.id, req.body)); }
  catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try { await articleService.deleteArticle(req.params.id); res.status(204).end(); } // 204 = ok, sans contenu
  catch (e) { next(e); }
};

module.exports = { list, get, create, update, remove };
