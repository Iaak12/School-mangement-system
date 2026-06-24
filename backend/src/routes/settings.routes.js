const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/settings.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');
const { uploadLogo } = require('../middlewares/upload.middleware');

router.use(protect);

router.get('/', ctrl.getSettings);
router.put('/', authorize('admin', 'principal'), ctrl.updateSettings);
router.post('/logo', authorize('admin', 'principal'), uploadLogo.single('logo'), ctrl.uploadLogo);

module.exports = router;
