const express = require('express');
const router = express.Router();
const githubController = require('../controllers/github.controller');
const { protect } = require('../middleware/auth.middleware');

// Public Webhook listener (protected by HMAC signature)
router.post('/webhook', githubController.handleWebhook);

// Protected GitHub user endpoints
router.use(protect);

router.get('/account', githubController.getAccountStatus);
router.post('/connect', githubController.connectGitHub);
router.delete('/disconnect', githubController.disconnectGitHub);
router.patch('/settings', githubController.updateSettings);
router.get('/repositories', githubController.getRepositories);
router.get('/pull-requests', githubController.getPullRequests);
router.post('/trigger-review', githubController.triggerManualReview);

module.exports = router;

