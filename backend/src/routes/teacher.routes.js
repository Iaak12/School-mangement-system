const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/teacher.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');

router.use(protect);

router.get('/', ctrl.getTeachers);
router.post('/', authorize('admin', 'principal'), ctrl.createTeacher);
router.get('/:id', ctrl.getTeacher);
router.put('/:id', authorize('admin', 'principal'), ctrl.updateTeacher);
router.delete('/:id', authorize('admin', 'principal'), ctrl.deleteTeacher);
router.put('/:id/assign-subjects', authorize('admin', 'principal'), ctrl.assignSubjects);

module.exports = router;
