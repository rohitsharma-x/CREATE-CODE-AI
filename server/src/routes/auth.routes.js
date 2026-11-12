const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/demo', authController.demoLogin);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

// OAuth endpoints (passport redirects or mock callbacks)
router.get('/google', (req, res) => {
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth?provider=google&status=mock_connect`);
});

router.get('/github', (req, res) => {
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth?provider=github&status=mock_connect`);
});

module.exports = router;

