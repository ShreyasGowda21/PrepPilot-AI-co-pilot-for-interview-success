const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { validateJD } = require('../validators/auth.validator');
const {
  createJD,
  listJDs,
  getJD,
  matchJDToResume,
  deleteJD,
} = require('../controllers/jd.controller');

router.use(protect);

router.post('/', validate(validateJD), createJD);
router.get('/', listJDs);
router.get('/:id', getJD);
router.post('/:id/match', matchJDToResume);
router.delete('/:id', deleteJD);

module.exports = router;
