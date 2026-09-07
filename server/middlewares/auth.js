// middlewares/auth.js — vérifie le jeton JWT et le rôle avant le contrôleur.

const jwt = require('jsonwebtoken');

// Exige un jeton JWT valide dans l'en-tête "Authorization: Bearer <token>".
const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET); // { id, email, role }
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' }); // jeton faux ou expiré
  }
};

// À mettre APRÈS authenticate : refuse si l'utilisateur n'est pas ADMIN.
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Admin required' });
  next();
};

module.exports = { authenticate, requireAdmin };
