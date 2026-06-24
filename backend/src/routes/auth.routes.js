const express = require('express');
const router = express.Router();
const { login, logout, refreshToken, forgotPassword, resetPassword, changePassword, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const { refreshTokenHandler } = require('../middlewares/auth.middleware');

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/refresh-token', refreshTokenHandler, refreshToken);

// Protected
router.use(protect);
router.post('/logout', logout);
router.get('/me', getMe);
router.put('/change-password', changePassword);

module.exports = router;
