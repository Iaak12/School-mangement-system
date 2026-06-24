const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/message.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/conversations', ctrl.getConversations);
router.get('/users', ctrl.getMessageableUsers);
router.get('/:userId', ctrl.getMessages);
router.post('/', ctrl.sendMessage);

module.exports = router;
