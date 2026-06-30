const articleService = require('../services/articleService');

const list = async (req, res, next) => {
  try {
    res.json(await articleService.getArticles(req.query));
  } catch (e) { next(e); }
};

const get = async (req, res, next) => {
  try {
    // getArticleBySlug incrémente les vues en interne
    res.json(await articleService.getArticleBySlug(req.params.slug));
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    res.status(201).json(await articleService.createArticle(req.body));
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    res.json(await articleService.updateArticle(req.params.id, req.body));
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    await articleService.deleteArticle(req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
};

module.exports = { list, get, create, update, remove };
