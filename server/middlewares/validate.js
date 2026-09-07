// middlewares/validate.js — stoppe la requête (422) si les règles express-validator ont échoué.

const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req); // erreurs accumulées par body('email').isEmail()...
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Validation failed',
      details: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = { validate };
