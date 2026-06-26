const router = require('express').Router();
const { login, me } = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
];

router.post('/login', loginValidation, login);
router.get('/me', authenticate, me);

module.exports = router;
