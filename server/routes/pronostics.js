// ============================================================================
//  routes/pronostics.js — pronostics des utilisateurs
// ============================================================================

const router = require('express').Router();
const { list, create, update, remove } = require('../controllers/pronosticController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.get('/',       list);                              // GET    -> tous les pronostics (public)
router.post('/',      authenticate, create);              // POST   -> créer un pronostic (connexion requise)
router.put('/:id',    authenticate, requireAdmin, update); // PUT   -> mettre à jour le résultat (admin)
router.delete('/:id', authenticate, requireAdmin, remove); // DELETE -> supprimer (admin)

module.exports = router;
