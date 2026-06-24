const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notice.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');

router.use(protect);

// Notifications
router.get('/notifications', ctrl.getNotifications);
router.put('/notifications/read-all', ctrl.markAllNotificationsRead);

// Notices
router.get('/', ctrl.getNotices);
router.post('/', authorize('admin', 'principal', 'teacher'), ctrl.createNotice);
router.put('/:id', authorize('admin', 'principal', 'teacher'), ctrl.updateNotice);
router.delete('/:id', authorize('admin', 'principal'), ctrl.deleteNotice);
router.put('/:id/publish', authorize('admin', 'principal'), ctrl.publishNotice);

module.exports = router;
