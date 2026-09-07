// controllers/authController.js — inscription / connexion / profil.

const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;
    res.status(201).json(await authService.register(email, password, username)); // { token, user }
  } catch (e) { next(e); }
};

const login = async (req, res, next) => {
  try { res.json(await authService.login(req.body.email, req.body.password)); } // { token, user }
  catch (e) { next(e); }
};

const me = async (req, res, next) => {
  try { res.json(await authService.getMe(req.user.id)); } // req.user vient du middleware authenticate
  catch (e) { next(e); }
};

module.exports = { register, login, me };
