const router = require('express').Router();
const { list, get, create, update, remove } = require('../controllers/articleController');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');

const articleValidation = [
  body('title').notEmpty().trim().escape(),
  body('category').isIn(['TRANSFERT','ACTU','ANALYSE','INTERVIEW','RESULTATS']),
  validate,
];

router.get('/', list);
router.get('/search', async (req, res, next) => {
  try {
    const pool = require('../config/db');
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);
    const [rows] = await pool.execute(
      `SELECT id, slug, title, summary, image_url AS imageUrl, category, published_at AS publishedAt
       FROM articles
       WHERE title LIKE ? OR summary LIKE ?
       ORDER BY published_at DESC
       LIMIT 5`,
      [`%${q}%`, `%${q}%`]
    );
    res.json(rows);
  } catch (e) { next(e); }
});
router.get('/:slug', get);
router.post('/', authenticate, requireAdmin, articleValidation, create);
router.put('/:id', authenticate, requireAdmin, update);
router.delete('/:id', authenticate, requireAdmin, remove);

module.exports = router;
