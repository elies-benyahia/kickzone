// ============================================================================
//  middlewares/validate.js — arrêt de la requête si la validation a échoué
//  À placer à la fin d'une liste de règles express-validator (voir routes/).
//  Toutes les données envoyées par l'utilisateur passent par ici avant le
//  contrôleur : c'est une protection contre les entrées invalides / malveillantes.
// ============================================================================

const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  // Récupère les erreurs accumulées par les règles (body('email').isEmail()...).
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // 422 = données reçues mais non valides. On renvoie le détail champ par champ.
    return res.status(422).json({
      error: 'Validation failed',
      details: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }

  next(); // tout est valide : on continue
};

module.exports = { validate };
