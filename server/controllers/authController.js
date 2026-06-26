const authService = require('../services/authService');

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (e) { next(e); }
};

const me = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json(user);
  } catch (e) { next(e); }
};

module.exports = { login, me };
