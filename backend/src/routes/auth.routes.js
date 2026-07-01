const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { register, login, logout, me } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { validateRegister, validateLogin } = require('../validators/auth.validator');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts. Try again later.', errors: [] },
});

router.post('/register', authLimiter, validate(validateRegister), register);
router.post('/login', authLimiter, validate(validateLogin), login);
router.post('/logout', logout);
router.get('/me', protect, me);

module.exports = router;
