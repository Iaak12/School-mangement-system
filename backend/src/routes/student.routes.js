const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/student.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');

router.use(protect);

router.get('/export/excel', authorize('admin', 'principal'), ctrl.exportStudentsExcel);
router.get('/', ctrl.getStudents);
router.post('/', authorize('admin', 'principal'), ctrl.createStudent);
router.get('/:id', ctrl.getStudent);
router.put('/:id', authorize('admin', 'principal'), ctrl.updateStudent);
router.delete('/:id', authorize('admin', 'principal'), ctrl.deleteStudent);
router.put('/:id/promote', authorize('admin', 'principal'), ctrl.promoteStudent);
router.put('/:id/transfer', authorize('admin', 'principal'), ctrl.transferStudent);
router.get('/:id/certificate/:type', authorize('admin', 'principal'), ctrl.generateCertificate);

module.exports = router;
