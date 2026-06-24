const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/homework.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');

router.use(protect);

router.get('/', ctrl.getHomework);
router.post('/', authorize('teacher', 'admin', 'principal'), ctrl.createHomework);
router.put('/:id', authorize('teacher', 'admin', 'principal'), ctrl.updateHomework);
router.delete('/:id', authorize('teacher', 'admin', 'principal'), ctrl.deleteHomework);
router.post('/:id/submit', authorize('student'), ctrl.submitAssignment);
router.get('/:id/submissions', authorize('teacher', 'admin', 'principal'), ctrl.getSubmissions);
router.put('/submissions/:id/grade', authorize('teacher', 'admin', 'principal'), ctrl.gradeSubmission);

module.exports = router;
