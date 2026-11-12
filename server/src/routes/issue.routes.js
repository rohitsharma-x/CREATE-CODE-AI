const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issue.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', issueController.getIssues);
router.patch('/:id/status', issueController.updateIssueStatus);

module.exports = router;

