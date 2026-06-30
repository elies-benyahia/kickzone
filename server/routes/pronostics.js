const router = require('express').Router();
const { list, create, update, remove } = require('../controllers/pronosticController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.get('/', list);
router.post('/', create);
router.put('/:id', authenticate, requireAdmin, update);
router.delete('/:id', authenticate, requireAdmin, remove);

module.exports = router;
