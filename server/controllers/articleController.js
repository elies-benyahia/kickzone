const articleService = require('../services/articleService');
const prisma = require('../services/prismaClient');

const list = async (req, res, next) => {
  try {
    const result = await articleService.getArticles(req.query);
    res.json(result);
  } catch (e) { next(e); }
};

const get = async (req, res, next) => {
  try {
    const article = await articleService.getArticleBySlug(req.params.slug);
    // Increment views asynchronously
    prisma.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    }).catch(() => {});
    res.json(article);
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const article = await articleService.createArticle(req.body);
    res.status(201).json(article);
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const article = await articleService.updateArticle(req.params.id, req.body);
    res.json(article);
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    await articleService.deleteArticle(req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
};

module.exports = { list, get, create, update, remove };
