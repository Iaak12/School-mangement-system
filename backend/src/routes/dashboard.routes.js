const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');
const { getAdminDashboard, getTeacherDashboard, getStudentDashboard, getParentDashboard } = require('../controllers/dashboard.controller');

router.use(protect);

router.get('/admin', authorize('admin', 'principal', 'accountant'), getAdminDashboard);
router.get('/teacher', authorize('teacher'), getTeacherDashboard);
router.get('/student', authorize('student'), getStudentDashboard);
router.get('/parent', authorize('parent'), getParentDashboard);

module.exports = router;
