// ============================================================================
//  controllers/authController.js — inscription / connexion / profil
// ============================================================================

const authService = require('../services/authService');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;
    const result = await authService.register(email, password, username);
    res.status(201).json(result); // { token, user }
  } catch (e) { next(e); }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json(result); // { token, user }
  } catch (e) { next(e); }
};

// GET /api/auth/me — req.user est rempli par le middleware authenticate.
const me = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json(user);
  } catch (e) { next(e); }
};

module.exports = { register, login, me };
