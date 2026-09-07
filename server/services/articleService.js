// ============================================================================
//  services/articleService.js — logique métier + SQL des articles
//  Le service est la seule couche qui parle à la base de données.
// ============================================================================

const pool = require('../config/db');

// Transforme un titre en "slug" utilisable dans une URL.
// Ex : "OFFICIEL : Gordon au Barça !" -> "officiel-gordon-au-barca"
const slugify = (text) =>
  text.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '') // enlève les accents (é -> e)
      .replace(/[^a-z0-9\s-]/g, '')            // enlève la ponctuation
      .trim()
      .replace(/\s+/g, '-')                    // espaces -> tirets
      .replace(/-+/g, '-')                     // pas de tirets multiples
      .substring(0, 80);                       // longueur max 80

// Garantit que le slug est unique : si "gordon" existe déjà, essaie "gordon-1", "gordon-2"...
const makeUniqueSlug = async (base) => {
  let slug = base;
  let i = 1;
  while (true) {
    const [[row]] = await pool.execute('SELECT id FROM articles WHERE slug = ? LIMIT 1', [slug]);
    if (!row) return slug;        // aucun article avec ce slug -> on le garde
    slug = `${base}-${i++}`;      // sinon on ajoute un numéro et on recommence
  }
};

// Liste paginée des articles, éventuellement filtrée par catégorie.
const getArticles = async ({ category, page = 1, limit = 20 } = {}) => {
  const pg  = parseInt(page,  10) || 1;
  const lim = parseInt(limit, 10) || 20;
  const offset = (pg - 1) * lim;          // nombre de lignes à sauter
  const params = [];
  let where = '';

  if (category) {                          // filtre optionnel
    where = 'WHERE category = ?';
    params.push(category);
  }

  // LIMIT / OFFSET insérés directement : ce sont des entiers calculés côté serveur,
  // il n'y a donc aucun risque d'injection SQL ici.
  const [rows] = await pool.execute(
    `SELECT id, slug, title, summary, image_url AS imageUrl, category,
            author, views, published_at AS publishedAt, created_at AS createdAt
     FROM articles ${where}
     ORDER BY published_at DESC
     LIMIT ${lim} OFFSET ${offset}`,
    params
  );

  // Nombre total d'articles (pour calculer le nombre de pages).
  const [[{ total }]] = await pool.execute(`SELECT COUNT(*) AS total FROM articles ${where}`, params);

  return {
    data: rows,
    meta: { total, page: pg, limit: lim, totalPages: Math.ceil(total / lim) },
  };
};

// Un article par son slug. Incrémente aussi son compteur de vues.
const getArticleBySlug = async (slug) => {
  const [[article]] = await pool.execute(
    `SELECT id, slug, title, summary, content, image_url AS imageUrl, category,
            author, views, published_at AS publishedAt, created_at AS createdAt
     FROM articles WHERE slug = ? LIMIT 1`,
    [slug]
  );
  if (!article) {
    const err = new Error('Article not found');
    err.status = 404;               // le contrôleur renverra un 404
    throw err;
  }

  // +1 vue, sans attendre le résultat (ne ralentit pas la réponse).
  pool.execute('UPDATE articles SET views = views + 1 WHERE id = ?', [article.id]).catch(() => {});

  return article;
};

// Création d'un article (réservé aux admins, voir routes/articles.js).
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

// Modification d'un article existant.
const updateArticle = async (id, { title, summary, content, imageUrl, category, author }) => {
  await pool.execute(
    `UPDATE articles
     SET title=?, summary=?, content=?, image_url=?, category=?, author=?, updated_at=NOW()
     WHERE id = ?`,
    [title, summary ?? null, content ?? null, imageUrl ?? null, category, author ?? null, Number(id)]
  );
  return { id: Number(id), title, summary, content, imageUrl, category, author };
};

// Suppression. Si aucune ligne n'est touchée, l'article n'existait pas -> 404.
const deleteArticle = async (id) => {
  const [result] = await pool.execute('DELETE FROM articles WHERE id = ?', [Number(id)]);
  if (result.affectedRows === 0) {
    const err = new Error('Article not found');
    err.status = 404;
    throw err;
  }
  return { success: true };
};

module.exports = { slugify, getArticles, getArticleBySlug, createArticle, updateArticle, deleteArticle };
