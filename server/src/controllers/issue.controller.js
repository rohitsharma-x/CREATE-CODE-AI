const Issue = require('../models/Issue');

/**
 * Get all issues with filters
 * GET /api/issues
 */
const getIssues = async (req, res, next) => {
  try {
    const { status, severity, category, project, search } = req.query;
    const query = { user: req.user._id };

    if (status && status !== 'All') query.status = status;
    if (severity && severity !== 'All') query.severity = severity;
    if (category && category !== 'All') query.category = category;
    if (project) query.project = project;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { file: { $regex: search, $options: 'i' } },
      ];
    }

    const issues = await Issue.find(query).sort('-createdAt').populate('project', 'name');

    // Aggregate statistics
    const stats = {
      total: await Issue.countDocuments({ user: req.user._id }),
      open: await Issue.countDocuments({ user: req.user._id, status: 'open' }),
      resolved: await Issue.countDocuments({ user: req.user._id, status: 'resolved' }),
      critical: await Issue.countDocuments({ user: req.user._id, severity: 'critical', status: 'open' }),
      bugs: await Issue.countDocuments({ user: req.user._id, category: 'bug' }),
      security: await Issue.countDocuments({ user: req.user._id, category: 'security' }),
      performance: await Issue.countDocuments({ user: req.user._id, category: 'performance' }),
      maintainability: await Issue.countDocuments({ user: req.user._id, category: 'maintainability' }),
    };

    res.status(200).json({
      success: true,
      stats,
      count: issues.length,
      issues,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update issue status
 * PATCH /api/issues/:id/status
 */
const updateIssueStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowed = ['open', 'resolved', 'dismissed', 'false_positive'];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value.',
      });
    }

    const issue = await Issue.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.',
      });
    }

    issue.status = status;
    if (status === 'resolved') {
      issue.resolvedAt = new Date();
    } else {
      issue.resolvedAt = undefined;
    }

    await issue.save();

    res.status(200).json({
      success: true,
      issue,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getIssues,
  updateIssueStatus,
};

