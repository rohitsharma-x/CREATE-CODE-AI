const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/')
  .get(reviewController.getReviews)
  .post(reviewController.createReview);

router.route('/:id')
  .get(reviewController.getReviewById)
  .delete(reviewController.deleteReview);

router.post('/:id/comments', reviewController.addComment);

module.exports = router;

