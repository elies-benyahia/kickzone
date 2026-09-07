// ============================================================================
//  controllers/articleController.js
//  Le contrôleur fait le lien entre la requête HTTP et le service :
//   - il lit les paramètres (req.query, req.params, req.body)
//   - il appelle le service (qui contient la logique + le SQL)
//   - il renvoie la réponse JSON avec le bon code HTTP
//   - en cas d'erreur, il la transmet au gestionnaire central via next(e)
// ============================================================================

const articleService = require('../services/articleService');

// GET /api/articles -> liste paginée
const list = async (req, res, next) => {
  try {
    res.json(await articleService.getArticles(req.query)); // req.query = { category, page, limit }
  } catch (e) { next(e); }
};

// GET /api/articles/:slug -> un article
const get = async (req, res, next) => {
  try {
    // getArticleBySlug incrémente aussi le compteur de vues.
    res.json(await articleService.getArticleBySlug(req.params.slug));
  } catch (e) { next(e); }
};

// POST /api/articles -> création (201 = créé)
const create = async (req, res, next) => {
  try {
    res.status(201).json(await articleService.createArticle(req.body));
  } catch (e) { next(e); }
};

// PUT /api/articles/:id -> modification
const update = async (req, res, next) => {
  try {
    res.json(await articleService.updateArticle(req.params.id, req.body));
  } catch (e) { next(e); }
};

// DELETE /api/articles/:id -> suppression (204 = OK, pas de contenu renvoyé)
const remove = async (req, res, next) => {
  try {
    await articleService.deleteArticle(req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
};

module.exports = { list, get, create, update, remove };
