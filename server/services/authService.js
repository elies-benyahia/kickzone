// services/authService.js — inscription / connexion / profil.
// Mot de passe haché avec bcrypt ; identité portée par un jeton JWT.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Jeton JWT contenant { id, email, role }, valable 7 jours.
const makeToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const register = async (email, password, username) => {
  const [[existing]] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  if (existing) { const err = new Error('Cet email est déjà utilisé'); err.status = 409; throw err; }

  const hash = await bcrypt.hash(password, 12); // 12 tours de salage
  const [result] = await pool.execute(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    [username ?? null, email, hash, 'USER']
  );
  const user = { id: result.insertId, email, username: username ?? null, role: 'USER' };
  return { token: makeToken({ id: user.id, email, role: 'USER' }), user };
};

const login = async (email, password) => {
  const [[user]] = await pool.execute(
    'SELECT id, username, email, password, role FROM users WHERE email = ? LIMIT 1', [email]
  );
  // Message identique si l'email est inconnu OU le mot de passe faux.
  if (!user || !(await bcrypt.compare(password, user.password))) {
    const err = new Error('Email ou mot de passe incorrect'); err.status = 401; throw err;
  }
  const publicUser = { id: user.id, email: user.email, username: user.username ?? null, role: user.role };
  return { token: makeToken({ id: user.id, email: user.email, role: user.role }), user: publicUser };
};

const getMe = async (userId) => {
  const [[user]] = await pool.execute(
    'SELECT id, username, email, role, created_at AS createdAt FROM users WHERE id = ? LIMIT 1', [Number(userId)]
  );
  if (!user) { const err = new Error('Utilisateur non trouvé'); err.status = 404; throw err; }
  return user;
};

module.exports = { register, login, getMe };
