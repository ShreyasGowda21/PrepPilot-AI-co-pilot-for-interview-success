const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const {
  validateInterviewSetup,
  validateAnswer,
} = require('../validators/auth.validator');
const {
  startInterview,
  getInterview,
  listInterviews,
  submitAnswer,
  completeInterview,
  abandonInterview,
} = require('../controllers/interview.controller');

router.use(protect);

router.post('/start', validate(validateInterviewSetup), startInterview);
router.get('/', listInterviews);
router.get('/:id', getInterview);
router.post('/:id/answer', validate(validateAnswer), submitAnswer);
router.post('/:id/complete', completeInterview);
router.post('/:id/abandon', abandonInterview);

module.exports = router;
