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
router.get('/:slug', get);
router.post('/', authenticate, requireAdmin, articleValidation, create);
router.put('/:id', authenticate, requireAdmin, update);
router.delete('/:id', authenticate, requireAdmin, remove);

module.exports = router;
