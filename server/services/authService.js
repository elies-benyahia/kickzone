// ============================================================================
//  services/authService.js — inscription, connexion, profil
//  Sécurité : le mot de passe est HACHÉ avec bcrypt (jamais stocké en clair).
//  L'identité est ensuite portée par un jeton JWT signé avec JWT_SECRET.
// ============================================================================

const bcrypt = require('bcryptjs');       // hachage des mots de passe
const jwt    = require('jsonwebtoken');   // création des jetons JWT
const pool   = require('../config/db');

// Crée un jeton JWT contenant { id, email, role }, valable JWT_EXPIRES_IN (7 jours).
const makeToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// --- Inscription -------------------------------------------------------
const register = async (email, password, username) => {
  // 1. Vérifie que l'email n'est pas déjà pris.
  const [[existing]] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  if (existing) {
    const err = new Error('Cet email est déjà utilisé');
    err.status = 409;               // 409 = conflit
    throw err;
  }

  // 2. Hache le mot de passe (12 tours de salage) puis insère l'utilisateur.
  const hash = await bcrypt.hash(password, 12);
  const [result] = await pool.execute(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    [username ?? null, email, hash, 'USER']
  );

  // 3. Renvoie un jeton + les infos publiques du nouvel utilisateur.
  const user = { id: result.insertId, email, username: username ?? null, role: 'USER' };
  return { token: makeToken({ id: user.id, email, role: 'USER' }), user };
};

// --- Connexion --------------------------------------------------------
const login = async (email, password) => {
  const [[user]] = await pool.execute(
    'SELECT id, username, email, password, role FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  // Même message d'erreur si l'email est inconnu OU si le mot de passe est faux
  // (on ne dit pas à un attaquant quel email existe).
  if (!user || !(await bcrypt.compare(password, user.password))) {
    const err = new Error('Email ou mot de passe incorrect');
    err.status = 401;
    throw err;
  }

  const publicUser = { id: user.id, email: user.email, username: user.username ?? null, role: user.role };
  return { token: makeToken({ id: user.id, email: user.email, role: user.role }), user: publicUser };
};

// --- Profil de l'utilisateur connecté --------------------------------
const getMe = async (userId) => {
  const [[user]] = await pool.execute(
    'SELECT id, username, email, role, created_at AS createdAt FROM users WHERE id = ? LIMIT 1',
    [Number(userId)]
  );
  if (!user) {
    const err = new Error('Utilisateur non trouvé');
    err.status = 404;
    throw err;
  }
  return user;
};

module.exports = { register, login, getMe };
