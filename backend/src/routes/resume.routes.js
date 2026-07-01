const router = require('express').Router();
const upload = require('../config/multer');
const { protect } = require('../middlewares/auth.middleware');
const {
  uploadAndAnalyse,
  listResumes,
  getResume,
  matchResumeToJd,
  deleteResume,
} = require('../controllers/resume.controller');

router.use(protect);

router.post('/upload', upload.single('resume'), uploadAndAnalyse);
router.get('/', listResumes);
router.get('/:id', getResume);
router.post('/:id/match', matchResumeToJd);
router.delete('/:id', deleteResume);

module.exports = router;
