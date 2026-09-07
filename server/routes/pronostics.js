// routes/pronostics.js — pronostics des utilisateurs.

const router = require('express').Router();
const { list, create, update, remove } = require('../controllers/pronosticController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.get('/',       list);                               // public
router.post('/',      authenticate, create);               // connexion requise
router.put('/:id',    authenticate, requireAdmin, update); // admin (marquer le résultat)
router.delete('/:id', authenticate, requireAdmin, remove); // admin

module.exports = router;
