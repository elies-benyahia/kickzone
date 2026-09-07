// ============================================================================
//  middlewares/auth.js — vérification du jeton JWT et du rôle
//  Un "middleware" est une fonction qui s'exécute AVANT le contrôleur.
//  Elle peut laisser passer (next()) ou bloquer la requête (res.status(...)).
// ============================================================================

const jwt = require('jsonwebtoken'); // librairie pour créer / vérifier les jetons JWT

// authenticate : exige un jeton JWT valide dans l'en-tête "Authorization".
const authenticate = (req, res, next) => {
  const header = req.headers.authorization; // ex : "Bearer eyJhbGci..."

  // Pas d'en-tête ou mauvais format -> 401 (non authentifié)
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token' });
  }

  try {
    // header.slice(7) enlève le préfixe "Bearer ".
    // jwt.verify échoue si le jeton est invalide ou expiré.
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next(); // jeton OK : on continue vers le contrôleur, req.user contient { id, email, role }
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// requireAdmin : à placer APRÈS authenticate. Refuse si l'utilisateur n'est pas ADMIN.
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin required' }); // 403 = authentifié mais pas autorisé
  }
  next();
};

module.exports = { authenticate, requireAdmin };
