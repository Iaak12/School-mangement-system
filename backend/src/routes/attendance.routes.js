const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/attendance.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');

router.use(protect);

router.get('/student/:studentId', ctrl.getStudentAttendance);
router.get('/monthly', ctrl.getMonthlyAttendance);
router.get('/report/export', authorize('admin', 'principal', 'teacher'), ctrl.exportAttendanceExcel);
router.get('/', ctrl.getAttendanceByDate);
router.post('/', authorize('admin', 'teacher', 'principal'), ctrl.markAttendance);

module.exports = router;
