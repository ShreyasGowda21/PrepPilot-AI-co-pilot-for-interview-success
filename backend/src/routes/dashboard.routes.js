const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const { getDashboard } = require('../controllers/dashboard.controller');

router.use(protect);
router.get('/', getDashboard);

module.exports = router;
