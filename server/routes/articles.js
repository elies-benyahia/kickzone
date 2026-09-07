// ============================================================================
//  routes/articles.js — URL des articles -> fonctions du contrôleur
//  Schéma général : URL  ->  [middlewares]  ->  contrôleur  ->  service  ->  BDD
// ============================================================================

const router = require('express').Router();
const { list, get, create, update, remove } = require('../controllers/articleController');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const { body } = require('express-validator'); // règles de validation sur le corps de la requête
const { validate } = require('../middlewares/validate');
const pool = require('../config/db');

// Règles appliquées à la création / modification d'un article.
const articleValidation = [
  body('title').notEmpty().trim().escape(),                                   // titre obligatoire, nettoyé
  body('category').isIn(['TRANSFERT', 'ACTU', 'ANALYSE', 'INTERVIEW', 'RESULTATS']), // catégorie autorisée
  validate,                                                                   // stoppe si une règle échoue
];

// GET /api/articles            -> liste paginée (filtre ?category, ?page, ?limit)
router.get('/', list);

// GET /api/articles/search?q=  -> recherche plein texte dans le titre / résumé (max 5 résultats)
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]); // trop court : on ne cherche pas
    const [rows] = await pool.execute(
      `SELECT id, slug, title, summary, image_url AS imageUrl, category, published_at AS publishedAt
       FROM articles
       WHERE title LIKE ? OR summary LIKE ?
       ORDER BY published_at DESC
       LIMIT 5`,
      [`%${q}%`, `%${q}%`] // % = n'importe quoi avant / après le mot cherché
    );
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /api/articles/:slug      -> un article (et incrémente son compteur de vues)
router.get('/:slug', get);

// Les routes suivantes exigent d'être connecté ET administrateur.
router.post('/',    authenticate, requireAdmin, articleValidation, create); // créer
router.put('/:id',  authenticate, requireAdmin, update);                    // modifier
router.delete('/:id', authenticate, requireAdmin, remove);                  // supprimer

module.exports = router;
