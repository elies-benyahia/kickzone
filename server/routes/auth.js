// routes/auth.js — inscription, connexion, profil.

const router = require('express').Router();
const { register, login, me } = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');

const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe minimum 6 caractères'),
  body('username').optional().trim().isLength({ min: 2, max: 50 }),
  validate,
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
];

router.post('/register', registerValidation, register); // crée un compte, renvoie un JWT
router.post('/login',    loginValidation,    login);    // vérifie le mot de passe, renvoie un JWT
router.get('/me',        authenticate,       me);       // profil de l'utilisateur connecté

module.exports = router;
