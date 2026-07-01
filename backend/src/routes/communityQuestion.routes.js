const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { validateCommunityQuestion } = require('../validators/auth.validator');
const {
  listCommunityQuestions,
  getCommunityQuestion,
  createCommunityQuestion,
  deleteCommunityQuestion,
} = require('../controllers/communityQuestion.controller');

// List + read are public; only the write side requires auth.
router.get('/', listCommunityQuestions);
router.get('/:id', getCommunityQuestion);
router.post('/', protect, validate(validateCommunityQuestion), createCommunityQuestion);
router.delete('/:id', protect, deleteCommunityQuestion);

module.exports = router;
