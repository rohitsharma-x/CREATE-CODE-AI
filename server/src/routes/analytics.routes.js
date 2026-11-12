const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/overview', analyticsController.getOverview);

module.exports = router;

