const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/exam.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');

router.use(protect);

router.get('/', ctrl.getExams);
router.post('/', authorize('admin', 'principal', 'teacher'), ctrl.createExam);
router.put('/:id', authorize('admin', 'principal', 'teacher'), ctrl.updateExam);
router.delete('/:id', authorize('admin', 'principal'), ctrl.deleteExam);
router.post('/:examId/results', authorize('admin', 'teacher', 'principal'), ctrl.enterMarks);
router.get('/:examId/results', ctrl.getExamResults);
router.get('/:examId/results/:studentId/report-card', ctrl.downloadReportCard);
router.put('/:examId/results/publish', authorize('admin', 'principal'), ctrl.publishResults);

module.exports = router;
