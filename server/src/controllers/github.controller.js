const crypto = require('crypto');
const User = require('../models/User');
const Repository = require('../models/Repository');
const WebhookEvent = require('../models/WebhookEvent');
const githubService = require('../services/github.service');
const encryptionService = require('../services/encryption.service');
const queueService = require('../services/queue.service');

/**
 * Get GitHub connection status and profile info
 * GET /api/github/account
 */
const getAccountStatus = async (req, res, next) => {
  try {
    const user = req.user;
    const isConnected = !!(user.githubId || user.githubUsername);

    const repositories = await Repository.find({ user: user._id });

    res.status(200).json({
      success: true,
      connected: isConnected,
      githubUsername: user.githubUsername || (isConnected ? 'rohit-dev' : null),
      avatar: user.avatar,
      connectedAt: user.githubConnectedAt || (isConnected ? new Date('2025-01-20') : null),
      settings: user.githubSettings || {
        autoReviewPR: true,
        commentOnPR: true,
        reviewOnPush: false,
      },
      repositories,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Connect GitHub account (Demo or token based)
 * POST /api/github/connect
 */
const connectGitHub = async (req, res, next) => {
  try {
    const { username, token } = req.body;
    const user = req.user;

    user.githubUsername = username || 'rohit-dev';
    user.githubId = `gh_${Date.now()}`;
    user.githubConnectedAt = new Date();

    if (token) {
      user.githubAccessTokenEncrypted = encryptionService.encrypt(token);
    }

    await user.save();

    // Seed default repositories if none exist
    const existingRepos = await Repository.countDocuments({ user: user._id });
    if (existingRepos === 0) {
      await Repository.create([
        {
          user: user._id,
          githubRepoId: '101',
          name: 'devreview-platform',
          fullName: `${user.githubUsername}/devreview-platform`,
          owner: { login: user.githubUsername, avatarUrl: user.avatar },
          defaultBranch: 'main',
          isPrivate: false,
          isConnected: true,
          autoReviewPR: true,
          commentOnPR: true,
        },
        {
          user: user._id,
          githubRepoId: '102',
          name: 'auth-service',
          fullName: `${user.githubUsername}/auth-service`,
          owner: { login: user.githubUsername, avatarUrl: user.avatar },
          defaultBranch: 'main',
          isPrivate: true,
          isConnected: true,
          autoReviewPR: true,
          commentOnPR: true,
        },
      ]);
    }

    res.status(200).json({
      success: true,
      message: 'GitHub account connected successfully.',
      connected: true,
      githubUsername: user.githubUsername,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Disconnect GitHub account
 * DELETE /api/github/disconnect
 */
const disconnectGitHub = async (req, res, next) => {
  try {
    const user = req.user;
    user.githubId = undefined;
    user.githubUsername = undefined;
    user.githubAccessTokenEncrypted = undefined;
    user.githubConnectedAt = undefined;
    await user.save();

    await Repository.updateMany({ user: user._id }, { isConnected: false });

    res.status(200).json({
      success: true,
      message: 'GitHub account disconnected.',
      connected: false,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update GitHub settings (autoReviewPR, commentOnPR, reviewOnPush)
 * PATCH /api/github/settings
 */
const updateSettings = async (req, res, next) => {
  try {
    const { autoReviewPR, commentOnPR, reviewOnPush } = req.body;
    const user = req.user;

    if (!user.githubSettings) user.githubSettings = {};
    if (autoReviewPR !== undefined) user.githubSettings.autoReviewPR = autoReviewPR;
    if (commentOnPR !== undefined) user.githubSettings.commentOnPR = commentOnPR;
    if (reviewOnPush !== undefined) user.githubSettings.reviewOnPush = reviewOnPush;

    await user.save();

    res.status(200).json({
      success: true,
      settings: user.githubSettings,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get repositories
 * GET /api/github/repositories
 */
const getRepositories = async (req, res, next) => {
  try {
    let repos = await Repository.find({ user: req.user._id });

    if (repos.length === 0 && req.user.githubUsername) {
      // Return simulated repo list
      repos = [
        {
          _id: 'repo1',
          name: 'devreview-platform',
          fullName: `${req.user.githubUsername}/devreview-platform`,
          defaultBranch: 'main',
          isPrivate: false,
          isConnected: true,
          autoReviewPR: true,
        },
        {
          _id: 'repo2',
          name: 'auth-service',
          fullName: `${req.user.githubUsername}/auth-service`,
          defaultBranch: 'main',
          isPrivate: true,
          isConnected: true,
          autoReviewPR: true,
        },
      ];
    }

    res.status(200).json({
      success: true,
      repositories: repos,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get pull requests for repository
 * GET /api/github/pull-requests
 */
const getPullRequests = async (req, res, next) => {
  try {
    const { repo = 'rohit-dev/devreview-platform' } = req.query;

    let prs = [
      {
        id: 42,
        number: 42,
        title: 'Add user authentication and JWT validation',
        state: 'open',
        user: { login: req.user.githubUsername || 'rohit-dev', avatar_url: req.user.avatar },
        base: { ref: 'main' },
        head: { ref: 'feature/auth' },
        filesCount: 5,
        commentsCount: 3,
        createdAt: new Date(Date.now() - 3600000 * 3),
      },
      {
        id: 43,
        number: 43,
        title: 'Optimize MongoDB indexes for review query performance',
        state: 'open',
        user: { login: req.user.githubUsername || 'rohit-dev', avatar_url: req.user.avatar },
        base: { ref: 'main' },
        head: { ref: 'perf/mongo-indexes' },
        filesCount: 3,
        commentsCount: 1,
        createdAt: new Date(Date.now() - 3600000 * 24),
      },
    ];

    res.status(200).json({
      success: true,
      pullRequests: prs,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Handle incoming GitHub Webhook
 * POST /api/github/webhook
 */
const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-hub-signature-256'];
    const event = req.headers['x-github-event'];
    const deliveryId = req.headers['x-github-delivery'] || `delivery_${Date.now()}`;

    const secret = process.env.GITHUB_WEBHOOK_SECRET || 'createcode_webhook_secret_key_12345';

    // Verify HMAC signature if secret & signature exist
    if (signature && req.rawBody) {
      const hmac = crypto.createHmac('sha256', secret);
      const digest = 'sha256=' + hmac.update(req.rawBody).digest('hex');
      if (signature !== digest) {
        return res.status(401).json({ success: false, message: 'Invalid webhook HMAC signature.' });
      }
    }

    const payload = req.body;
    const repoFullName = payload.repository?.full_name;

    console.log(`[GitHub Webhook] Received event: ${event} for repo: ${repoFullName}`);

    // Prevent duplicate event execution
    const existing = await WebhookEvent.findOne({ deliveryId });
    if (existing) {
      return res.status(200).json({ success: true, message: 'Event already processed.' });
    }

    await WebhookEvent.create({
      deliveryId,
      event: event || 'pull_request',
      repository: repoFullName || 'unknown',
      sender: payload.sender?.login,
      action: payload.action,
      payload,
      status: 'processing',
    });

    // Check if it's a pull_request opened or synchronize event
    if (event === 'pull_request' && ['opened', 'synchronize', 'reopened'].includes(payload.action)) {
      const pr = payload.pull_request;
      const repoDoc = await Repository.findOne({ fullName: repoFullName });

      if (repoDoc && repoDoc.autoReviewPR) {
        // Enqueue background review job
        await queueService.enqueueReviewJob({
          userId: repoDoc.user,
          repoFullName,
          prNumber: pr.number,
          prTitle: pr.title,
          branch: {
            base: pr.base?.ref || 'main',
            head: pr.head?.ref || 'feature',
          },
          files: [],
        });
      }
    }

    res.status(200).json({ success: true, message: 'Webhook event dispatched.' });
  } catch (err) {
    next(err);
  }
};

/**
 * Manually trigger review for a pull request
 * POST /api/github/trigger-review
 */
const triggerManualReview = async (req, res, next) => {
  try {
    const { repoFullName, prNumber, prTitle } = req.body;

    const sampleFiles = [
      {
        filename: 'server/src/middleware/auth.middleware.js',
        status: 'modified',
        additions: 15,
        deletions: 2,
        patch: `+ const token = req.cookies.token || req.headers['authorization'];\n+ if (!token) return res.status(401).json({ error: 'Unauthorized' });`,
      },
      {
        filename: 'server/src/controllers/auth.controller.js',
        status: 'modified',
        additions: 42,
        deletions: 5,
        patch: `+ const user = await User.findOne({ email });\n+ const isMatch = await bcrypt.compare(password, user.passwordHash);`,
      },
    ];

    const job = await queueService.enqueueReviewJob({
      userId: req.user._id,
      repoFullName: repoFullName || `${req.user.githubUsername || 'rohit-dev'}/devreview-platform`,
      prNumber: prNumber || 42,
      prTitle: prTitle || 'Add user authentication and JWT validation',
      branch: { base: 'main', head: 'feature/auth' },
      files: sampleFiles,
    });

    res.status(200).json({
      success: true,
      message: 'Review queued in background.',
      jobId: job.id,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAccountStatus,
  connectGitHub,
  disconnectGitHub,
  updateSettings,
  getRepositories,
  getPullRequests,
  handleWebhook,
  triggerManualReview,
};

