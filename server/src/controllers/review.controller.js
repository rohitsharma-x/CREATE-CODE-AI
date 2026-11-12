const Review = require('../models/Review');
const Issue = require('../models/Issue');
const Notification = require('../models/Notification');
const User = require('../models/User');
const aiService = require('../services/ai.service');

/**
 * Get all reviews for current user
 * GET /api/reviews
 */
const getReviews = async (req, res, next) => {
  try {
    const { status, project, reviewType, search } = req.query;
    const query = { user: req.user._id };

    if (status) query.status = status;
    if (project) query.project = project;
    if (reviewType) query.reviewType = reviewType;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { repository: { $regex: search, $options: 'i' } },
        { 'branch.head': { $regex: search, $options: 'i' } },
      ];
    }

    const reviews = await Review.find(query).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single review with findings and comments
 * GET /api/reviews/:id
 */
const getReviewById = async (req, res, next) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review record not found.',
      });
    }

    res.status(200).json({
      success: true,
      review,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new code review (snippet or uploaded file)
 * POST /api/reviews
 */
const createReview = async (req, res, next) => {
  try {
    const { title, filename, language, project, reviewType, repository, branch } = req.body;
    const sourceCode = req.body.code || req.body.rawCode;

    if (!sourceCode) {
      return res.status(400).json({
        success: false,
        message: 'Source code is required for review.',
      });
    }

    const cleanFilename = filename || (language === 'python' ? 'app.py' : language === 'cpp' ? 'main.cpp' : 'index.js');
    const reviewTitle = title || `Review for ${cleanFilename}`;

    // 1. Run AI review analysis
    const analysis = await aiService.generateCodeReview({
      code: sourceCode,
      filename: cleanFilename,
      language: language || 'javascript',
      title: reviewTitle,
    });

    // 2. Count existing reviews
    const totalCount = await Review.countDocuments({ user: req.user._id });
    const reviewNumber = totalCount + 101; // e.g. CR-101, CR-102

    // 3. Create Review
    const review = await Review.create({
      user: req.user._id,
      project: project || null,
      reviewNumber,
      title: reviewTitle,
      reviewType: reviewType || 'snippet',
      repository: repository || (project ? 'linked-project' : 'standalone-code'),
      branch: branch || { base: 'main', head: 'feature/optimization' },
      overallScore: analysis.overallScore,
      metrics: analysis.metrics,
      summary: analysis.summary,
      findings: analysis.findings,
      filesChanged: [
        {
          filename: cleanFilename,
          status: 'reviewed',
          additions: sourceCode.split('\n').length,
          deletions: 0,
          patch: sourceCode,
        },
      ],
      rawCode: sourceCode,
      language: language || 'javascript',
      optimizedCode: analysis.optimizedCode || '',
      complexityComparison: analysis.complexityComparison || {
        originalTime: 'O(N)',
        optimizedTime: 'O(N)',
        originalSpace: 'O(1)',
        optimizedSpace: 'O(1)',
        explanation: 'Time and space complexity evaluated.',
      },
      optimizationSuggestions: analysis.optimizationSuggestions || [],
      isAlreadyOptimal: !!analysis.isAlreadyOptimal,
      optimalExplanation: analysis.optimalExplanation || '',
      testCases: analysis.testCases || [],
      status: 'completed',
    });

    // 4. Create Issue records for critical/high findings
    for (const f of analysis.findings) {
      if (['critical', 'high', 'medium'].includes(f.severity)) {
        await Issue.create({
          user: req.user._id,
          project: project || null,
          review: review._id,
          title: f.title,
          description: f.description,
          severity: f.severity,
          category: f.category || 'bug',
          file: f.file || cleanFilename,
          lineStart: f.lineStart,
          lineEnd: f.lineEnd,
          suggestedFix: f.suggestion,
          status: 'open',
        });
      }
    }

    // 5. Update usage & dispatch notification
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'apiUsage.reviewsCount': 1 },
    });

    await Notification.create({
      user: req.user._id,
      type: 'review_completed',
      title: `Review Completed: #CR-${reviewNumber}`,
      message: `Score: ${review.overallScore}/100. Found ${review.summary.bugsCount} bugs and ${review.summary.securityCount} security issues.`,
      link: `/reviews/${review._id}`,
    });

    res.status(201).json({
      success: true,
      review,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Add comment to review
 * POST /api/reviews/:id/comments
 */
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required.' });
    }

    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    review.comments.push({
      user: req.user._id,
      authorName: req.user.name,
      text,
      createdAt: new Date(),
    });

    await review.save();

    res.status(200).json({
      success: true,
      comments: review.comments,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete review
 * DELETE /api/reviews/:id
 */
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    await Issue.deleteMany({ review: review._id });

    res.status(200).json({
      success: true,
      message: 'Review deleted.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getReviews,
  getReviewById,
  createReview,
  addComment,
  deleteReview,
};

