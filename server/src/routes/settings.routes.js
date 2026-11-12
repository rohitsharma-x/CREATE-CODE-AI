const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.patch('/profile', settingsController.updateProfile);
router.patch('/preferences', settingsController.updatePreferences);
router.post('/change-password', settingsController.changePassword);
router.get('/usage', settingsController.getApiUsage);

module.exports = router;

