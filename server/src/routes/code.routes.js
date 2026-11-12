const express = require('express');
const router = express.Router();
const codeController = require('../controllers/code.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/languages', codeController.getLanguages);
router.post('/execute', protect, codeController.executeCode);
router.post('/test-cases', protect, codeController.runTestCases);

module.exports = router;

