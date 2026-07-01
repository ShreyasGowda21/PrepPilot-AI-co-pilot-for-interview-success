const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/resumes', require('./resume.routes'));
router.use('/job-descriptions', require('./jd.routes'));
router.use('/interviews', require('./interview.routes'));
router.use('/community-questions', require('./communityQuestion.routes'));
router.use('/dashboard', require('./dashboard.routes'));

router.get('/health', (_req, res) => res.json({ success: true, message: 'OK' }));

module.exports = router;
