// services/articleService.js — logique + SQL des articles (seule couche qui parle à la base).

const pool = require('../config/db');

// Titre -> slug d'URL : "OFFICIEL : Gordon au Barça !" -> "officiel-gordon-au-barca"
const slugify = (text) =>
  text.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '') // enlève les accents
      .replace(/[^a-z0-9\s-]/g, '')            // enlève la ponctuation
      .trim().replace(/\s+/g, '-').replace(/-+/g, '-')
      .substring(0, 80);

// Rend le slug unique : "gordon", puis "gordon-1", "gordon-2"...
const makeUniqueSlug = async (base) => {
  let slug = base, i = 1;
  while (true) {
    const [[row]] = await pool.execute('SELECT id FROM articles WHERE slug = ? LIMIT 1', [slug]);
    if (!row) return slug;
    slug = `${base}-${i++}`;
  }
};

// Liste paginée, filtre optionnel par catégorie.
const getArticles = async ({ category, page = 1, limit = 20 } = {}) => {
  const pg = parseInt(page, 10) || 1;
  const lim = parseInt(limit, 10) || 20;
  const offset = (pg - 1) * lim;
  const where = category ? 'WHERE category = ?' : '';
  const params = category ? [category] : [];

  // LIMIT/OFFSET = entiers calculés ici -> pas de risque d'injection.
  const [rows] = await pool.execute(
    `SELECT id, slug, title, summary, image_url AS imageUrl, category, author, views,
            published_at AS publishedAt, created_at AS createdAt
     FROM articles ${where} ORDER BY published_at DESC LIMIT ${lim} OFFSET ${offset}`,
    params
  );
  const [[{ total }]] = await pool.execute(`SELECT COUNT(*) AS total FROM articles ${where}`, params);

  return { data: rows, meta: { total, page: pg, limit: lim, totalPages: Math.ceil(total / lim) } };
};

// Un article par slug + incrément du compteur de vues.
const getArticleBySlug = async (slug) => {
  const [[article]] = await pool.execute(
    `SELECT id, slug, title, summary, content, image_url AS imageUrl, category, author, views,
            published_at AS publishedAt, created_at AS createdAt
     FROM articles WHERE slug = ? LIMIT 1`, [slug]
  );
  if (!article) { const err = new Error('Article not found'); err.status = 404; throw err; }

  pool.execute('UPDATE articles SET views = views + 1 WHERE id = ?', [article.id]).catch(() => {}); // sans attendre
  return article;
};

const createArticle = async ({ title, summary, content, imageUrl, category, author, publishedAt }) => {
  const slug = await makeUniqueSlug(slugify(title));
  const [result] = await pool.execute(
    `INSERT INTO articles (slug, title, summary, content, image_url, category, author, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [slug, title, summary ?? null, content ?? null, imageUrl ?? null, category, author ?? null,
     publishedAt ? new Date(publishedAt) : new Date()]
  );
  return { id: result.insertId, slug, title, summary, content, imageUrl, category, author };
};

const updateArticle = async (id, { title, summary, content, imageUrl, category, author }) => {
  await pool.execute(
    `UPDATE articles SET title=?, summary=?, content=?, image_url=?, category=?, author=?, updated_at=CURRENT_TIMESTAMP
     WHERE id = ?`,
    [title, summary ?? null, content ?? null, imageUrl ?? null, category, author ?? null, Number(id)]
  );
  return { id: Number(id), title, summary, content, imageUrl, category, author };
};

// 0 ligne touchée -> l'article n'existait pas.
const deleteArticle = async (id) => {
  const [result] = await pool.execute('DELETE FROM articles WHERE id = ?', [Number(id)]);
  if (result.affectedRows === 0) { const err = new Error('Article not found'); err.status = 404; throw err; }
  return { success: true };
};

module.exports = { slugify, getArticles, getArticleBySlug, createArticle, updateArticle, deleteArticle };
