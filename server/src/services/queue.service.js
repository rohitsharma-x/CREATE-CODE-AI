const EventEmitter = require('events');
const aiService = require('./ai.service');
const linterService = require('./linter.service');
const githubService = require('./github.service');
const encryptionService = require('./encryption.service');
const Review = require('../models/Review');
const Issue = require('../models/Issue');
const Notification = require('../models/Notification');
const User = require('../models/User');

const localQueue = new EventEmitter();

let prQueue = null;
let queueWorker = null;
let isRedisAvailable = false;

/**
 * Initialize BullMQ with Redis or In-Memory fallback
 */
const initQueue = async () => {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  try {
    const { Queue, Worker } = require('bullmq');
    const IORedis = require('ioredis');

    const connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      connectTimeout: 2000,
      lazyConnect: true,
      enableOfflineQueue: false,
      retryStrategy: () => null, // don't loop retry if redis is not running
    });

    connection.on('error', (err) => {
      // suppress unhandled error event when redis is offline
    });

    await connection.connect();
    isRedisAvailable = true;
    console.log('[Queue] Connected to Redis. BullMQ initialized.');

    prQueue = new Queue('pr-reviews', { connection });

    queueWorker = new Worker(
      'pr-reviews',
      async (job) => {
        console.log(`[Queue Worker] Processing BullMQ job #${job.id}: ${job.name}`);
        return await processReviewJob(job.data);
      },
      { connection }
    );

    queueWorker.on('completed', (job) => {
      console.log(`[Queue Worker] BullMQ job #${job.id} completed successfully.`);
    });

    queueWorker.on('failed', (job, err) => {
      console.error(`[Queue Worker] BullMQ job #${job?.id} failed:`, err.message);
    });
  } catch (err) {
    isRedisAvailable = false;
    console.warn(`[Queue] Redis connection failed (${err.message}). Using resilient in-memory background worker.`);
  }

  // Set up in-memory listener
  localQueue.on('process-review', async (data) => {
    try {
      console.log('[Local Queue] Processing PR review job in background...');
      await processReviewJob(data);
    } catch (err) {
      console.error('[Local Queue] Error processing background job:', err.message);
    }
  });
};

/**
 * Enqueue a PR review job
 */
const enqueueReviewJob = async (jobData) => {
  if (isRedisAvailable && prQueue) {
    return await prQueue.add('review-pr', jobData, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  } else {
    // Execute asynchronously via local queue
    setImmediate(() => {
      localQueue.emit('process-review', jobData);
    });
    return { id: `local-${Date.now()}` };
  }
};

/**
 * Core Review Worker Processing
 */
const processReviewJob = async (data) => {
  const { userId, repoFullName, prNumber, prTitle, branch, files = [] } = data;

  const user = await User.findById(userId);
  if (!user) return;

  let combinedCode = '';
  files.forEach((f) => {
    combinedCode += `// File: ${f.filename}\n${f.patch || ''}\n\n`;
  });

  if (!combinedCode.trim()) {
    combinedCode = `// Pull Request #${prNumber}: ${prTitle}\n// Changes evaluated.`;
  }

  // 1. Generate AI review
  const reviewResult = await aiService.generateCodeReview({
    code: combinedCode,
    filename: files[0]?.filename || 'pr-changes.js',
    language: 'javascript',
    title: prTitle,
    prNumber,
    branch,
  });

  // 2. Count existing reviews to get next number
  const count = await Review.countDocuments({ user: user._id });

  // 3. Save Review in MongoDB
  const reviewDoc = new Review({
    user: user._id,
    reviewNumber: count + 1,
    title: `PR #${prNumber}: ${prTitle}`,
    reviewType: 'pr',
    repository: repoFullName,
    prNumber,
    prTitle,
    branch: {
      base: branch?.base || 'main',
      head: branch?.head || 'feature',
    },
    status: 'completed',
    overallScore: reviewResult.overallScore,
    metrics: reviewResult.metrics,
    summary: reviewResult.summary,
    findings: reviewResult.findings,
    filesChanged: files.map((f) => ({
      filename: f.filename,
      status: f.status || 'modified',
      additions: f.additions || 0,
      deletions: f.deletions || 0,
      patch: f.patch,
    })),
    rawCode: combinedCode,
  });

  await reviewDoc.save();

  // 4. Create Issue records for critical and high findings
  for (const finding of reviewResult.findings) {
    if (['critical', 'high'].includes(finding.severity)) {
      await Issue.create({
        user: user._id,
        review: reviewDoc._id,
        title: finding.title,
        description: finding.description,
        severity: finding.severity,
        category: finding.category || 'bug',
        file: finding.file,
        lineStart: finding.lineStart,
        lineEnd: finding.lineEnd,
        suggestedFix: finding.suggestion,
        status: 'open',
      });
    }
  }

  // 5. Notify user
  await Notification.create({
    user: user._id,
    type: 'pr_review_completed',
    title: `PR Review Completed: #${prNumber}`,
    message: `Review #${reviewDoc.reviewNumber} completed with overall score ${reviewResult.overallScore}/100.`,
    link: `/reviews/${reviewDoc._id}`,
    metadata: { reviewId: reviewDoc._id, prNumber, repo: repoFullName },
  });

  // 6. Post GitHub comment if user enabled it
  if (user.githubSettings?.commentOnPR && user.githubAccessTokenEncrypted) {
    try {
      const token = encryptionService.decrypt(user.githubAccessTokenEncrypted);
      const [owner, repo] = repoFullName.split('/');
      const commentBody = `### 🤖 CreateCode AI Automated Review

**Overall Score:** ${reviewResult.overallScore}/100
- **Code Quality:** ${reviewResult.metrics.codeQuality}%
- **Security:** ${reviewResult.metrics.security}%
- **Performance:** ${reviewResult.metrics.performance}%
- **Maintainability:** ${reviewResult.metrics.maintainability}%

**Summary:**
- 🐛 ${reviewResult.summary.bugsCount} Bugs Found
- 🛡️ ${reviewResult.summary.securityCount} Security Issues
- 💡 ${reviewResult.summary.improvementsCount} Improvements

View complete review in [CreateCode AI Dashboard](${process.env.CLIENT_URL || 'http://localhost:5173'}/reviews/${reviewDoc._id}).`;

      await githubService.createPullRequestReviewComment(token, owner, repo, prNumber, commentBody);
      console.log(`[GitHub] Successfully posted review comment on ${repoFullName} PR #${prNumber}`);
    } catch (commentErr) {
      console.warn('[GitHub] Could not post review comment:', commentErr.message);
    }
  }

  return reviewDoc;
};

module.exports = {
  initQueue,
  enqueueReviewJob,
};
