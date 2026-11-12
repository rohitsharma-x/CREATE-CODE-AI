const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/Project');
const Review = require('../models/Review');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Issue = require('../models/Issue');
const Repository = require('../models/Repository');
const Notification = require('../models/Notification');
const encryptionService = require('../services/encryption.service');

const seedInitialData = async () => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.log('[Seed] Database connection not ready. Skipping initial seed.');
      return;
    }
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('[Seed] Database already populated. Skipping initial seed.');
      return;
    }

    console.log('[Seed] Seeding initial demonstration data matching UI references...');

    // 1. Create Default Rohit Sharma User
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('DemoPass123!', salt);

    const user = await User.create({
      name: 'Rohit Sharma',
      email: 'rohit.sharma@example.com',
      username: 'rohit-dev',
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      bio: 'Full-stack developer | MERN | Open Source',
      preferredLanguages: ['JavaScript', 'Python', 'C++'],
      role: 'developer',
      themePreference: 'dark',
      defaultLanguage: 'javascript',
      defaultAiMode: 'Debug',
      githubUsername: 'rohit-dev',
      githubId: 'gh_1048291',
      githubConnectedAt: new Date('2025-01-20'),
      githubSettings: {
        autoReviewPR: true,
        commentOnPR: true,
        reviewOnPush: false,
      },
      apiUsage: {
        aiRequests: 42,
        codeExecutions: 18,
        reviewsCount: 24,
        limits: {
          aiRequests: 500,
          codeExecutions: 200,
          reviewsCount: 100,
        },
      },
    });

    // 2. Create Projects (Matching Image 4)
    const p1 = await Project.create({
      user: user._id,
      name: 'DevReview Platform',
      description: 'Main platform for AI code review and development.',
      languages: ['JavaScript', 'HTML/CSS'],
      techStack: ['MERN', 'Tailwind', 'Docker'],
      status: 'Active',
      progress: 72,
      githubRepo: {
        repoId: '101',
        fullName: 'rohit-dev/devreview-platform',
        defaultBranch: 'main',
        url: 'https://github.com/rohit-dev/devreview-platform',
      },
      activity: [
        { action: 'Review Completed', details: 'Automated review #CR-142 completed', timestamp: new Date(Date.now() - 300000) },
        { action: 'Code Pushed', details: 'Pushed commit 4f2a1b to feature/auth', timestamp: new Date(Date.now() - 3600000) },
      ],
    });

    const p2 = await Project.create({
      user: user._id,
      name: 'Authentication Service',
      description: 'User auth, OAuth (Google & GitHub) and RBAC.',
      languages: ['JavaScript'],
      techStack: ['Node.js', 'Express', 'Passport.js', 'JWT'],
      status: 'Active',
      progress: 60,
      githubRepo: {
        repoId: '102',
        fullName: 'rohit-dev/auth-service',
        defaultBranch: 'main',
        url: 'https://github.com/rohit-dev/auth-service',
      },
      activity: [
        { action: 'Bug Detected', details: 'Off-by-one bug found in index verification', timestamp: new Date(Date.now() - 2100000) },
      ],
    });

    const p3 = await Project.create({
      user: user._id,
      name: 'AI Chat Assistant',
      description: 'Coding chat with debugging, optimization and explanations.',
      languages: ['JavaScript', 'Python'],
      techStack: ['React', 'Gemini AI', 'SSE'],
      status: 'In Progress',
      progress: 45,
      githubRepo: {
        repoId: '103',
        fullName: 'rohit-dev/ai-assistant',
        defaultBranch: 'master',
        url: 'https://github.com/rohit-dev/ai-assistant',
      },
    });

    // 3. Create Sample Code Review (Matching Image 6: Review #CR-142)
    const reviewCode = `int sum(int arr[], int n) {
    int sum = 0;
    for (int i = 0; i <= n; i++) {
        sum += arr[i];
    }
    return sum;
}`;

    const review = await Review.create({
      user: user._id,
      project: p1._id,
      reviewNumber: 142,
      title: 'PR #42: Add user authentication',
      reviewType: 'pr',
      repository: 'devreview-ai/backend',
      prNumber: 42,
      prTitle: 'Add user authentication',
      branch: {
        base: 'main',
        head: 'feature/auth',
      },
      status: 'completed',
      overallScore: 86,
      metrics: {
        codeQuality: 88,
        security: 80,
        performance: 85,
        maintainability: 90,
      },
      summary: {
        bugsCount: 2,
        securityCount: 1,
        improvementsCount: 3,
        optimizationsCount: 1,
        overview: 'Review completed for PR #42. Identified 2 array boundary bugs and 1 JWT token expiration security risk.',
      },
      findings: [
        {
          file: 'src/utils/arrayHelper.cpp',
          lineStart: 3,
          lineEnd: 3,
          category: 'bug',
          severity: 'high',
          title: 'Array Index Out of Bounds',
          description: 'Loop condition uses i <= n, which attempts to read arr[n], resulting in undefined memory behavior.',
          suggestion: 'Change loop termination condition from <= to <.',
          suggestedCode: 'for (int i = 0; i < n; i++) {',
        },
        {
          file: 'src/middleware/auth.js',
          lineStart: 18,
          lineEnd: 24,
          category: 'security',
          severity: 'critical',
          title: 'Missing Token Expiration Validation',
          description: 'JWT verification does not enforce token expiration window, allowing stale sessions to stay valid.',
          suggestion: 'Pass maxAge or verify exp claim in jwt.verify options.',
          suggestedCode: 'jwt.verify(token, process.env.JWT_SECRET, { maxAge: "7d" });',
        },
        {
          file: 'src/controllers/user.controller.js',
          lineStart: 45,
          lineEnd: 48,
          category: 'performance',
          severity: 'medium',
          title: 'Unindexed Database Query in Loop',
          description: 'Executing unindexed user queries inside a map loop causes N+1 query latency.',
          suggestion: 'Use MongoDB $in operator to batch fetch documents.',
          suggestedCode: 'const users = await User.find({ _id: { $in: userIds } });',
        },
      ],
      filesChanged: [
        { filename: 'src/utils/arrayHelper.cpp', status: 'modified', additions: 12, deletions: 4, patch: reviewCode },
        { filename: 'src/middleware/auth.js', status: 'modified', additions: 25, deletions: 6, patch: '...' },
        { filename: 'src/controllers/user.controller.js', status: 'modified', additions: 34, deletions: 12, patch: '...' },
      ],
      comments: [
        { authorName: 'Rohit Sharma', text: 'Fixed the loop condition in commit 8d3b2a.', createdAt: new Date(Date.now() - 1080000) },
      ],
      rawCode: reviewCode,
      language: 'cpp',
    });

    // 4. Create Issues (Matching Reference Image 3 & 6)
    await Issue.create([
      {
        user: user._id,
        project: p1._id,
        review: review._id,
        title: 'Array Index Out of Bounds in arrayHelper',
        description: 'Loop condition uses <= which triggers out of bounds memory read at line 3.',
        severity: 'high',
        category: 'bug',
        status: 'open',
        file: 'src/utils/arrayHelper.cpp',
        lineStart: 3,
        lineEnd: 3,
        suggestedFix: 'Replace i <= n with i < n',
      },
      {
        user: user._id,
        project: p1._id,
        review: review._id,
        title: 'Missing Token Expiration Validation',
        description: 'JWT verification does not enforce expiration time window.',
        severity: 'critical',
        category: 'security',
        status: 'open',
        file: 'src/middleware/auth.js',
        lineStart: 18,
        lineEnd: 24,
        suggestedFix: 'Enforce maxAge in jwt.verify',
      },
      {
        user: user._id,
        project: p2._id,
        title: 'Potential Cross-Site Scripting (XSS)',
        description: 'Direct assignment of unsanitized input to innerHTML.',
        severity: 'high',
        category: 'security',
        status: 'open',
        file: 'src/views/profile.js',
        lineStart: 42,
        lineEnd: 42,
        suggestedFix: 'Use textContent or DOMPurify sanitize()',
      },
      {
        user: user._id,
        project: p1._id,
        title: 'Redundant Database Queries inside Loop',
        description: 'Sequential queries cause N+1 database round trips.',
        severity: 'medium',
        category: 'performance',
        status: 'resolved',
        file: 'src/controllers/user.controller.js',
        lineStart: 45,
        lineEnd: 48,
        suggestedFix: 'Batch with $in query',
        resolvedAt: new Date(Date.now() - 86400000),
      },
    ]);

    // 5. Create AI Chats (Matching Reference Image 5)
    const chat1 = await Chat.create({
      user: user._id,
      project: p1._id,
      title: 'Array out of bounds error',
      language: 'cpp',
      mode: 'Debug',
      lastMessageAt: new Date(),
    });

    await Message.create([
      {
        chat: chat1._id,
        user: user._id,
        sender: 'user',
        text: 'Find the error in this code and optimize it:',
        code: reviewCode,
        language: 'cpp',
        mode: 'Debug',
      },
      {
        chat: chat1._id,
        user: user._id,
        sender: 'assistant',
        text: 'Array index out of bounds at line 3. You are using i <= n, which tries to access arr[n]. Valid indices are 0 to n - 1.',
        code: `int sum(int arr[], int n) {
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum += arr[i];
    }
    return sum;
}`,
        language: 'cpp',
        mode: 'Debug',
        structuredResponse: {
          summary: 'Identified off-by-one array index out of bounds error at line 3.',
          errors: [
            { line: 3, type: 'LogicError', message: 'Array index out of bounds at line 3. You are using i <= n, which tries to access arr[n]. Valid indices are 0 to n - 1.' }
          ],
          severity: 'critical',
          explanation: 'In C++, array indexing is 0-indexed, meaning valid indices for an array of size n are 0 through n-1. When i reaches n, arr[n] accesses unallocated or out-of-bounds memory.',
          correctedCode: `int sum(int arr[], int n) {\n    int sum = 0;\n    for (int i = 0; i < n; i++) {\n        sum += arr[i];\n    }\n    return sum;\n}`,
          optimizations: ['Corrected loop bound from <= n to < n', 'Maintained O(n) linear scan with O(1) auxiliary memory'],
          timeComplexity: 'O(n) - Single pass over n elements',
          spaceComplexity: 'O(1) - Constant auxiliary storage',
          testCases: [
            { input: '{1, 2, 3, 4, 5}, 5', expectedOutput: '15', description: 'Standard array sum', type: 'normal' },
            { input: '{0}, 1', expectedOutput: '0', description: 'Single element array', type: 'boundary' },
            { input: '{}, 0', expectedOutput: '0', description: 'Empty array input', type: 'edge' }
          ],
          warnings: ['Passing n larger than actual array allocation may still cause memory violation.']
        }
      }
    ]);

    await Chat.create([
      {
        user: user._id,
        title: 'Explain time complexity',
        language: 'javascript',
        mode: 'Complexity Analysis',
        lastMessageAt: new Date(Date.now() - 86400000),
      },
      {
        user: user._id,
        title: 'Convert Python to JavaScript',
        language: 'python',
        mode: 'Code Conversion',
        lastMessageAt: new Date(Date.now() - 90000000),
      },
      {
        user: user._id,
        title: 'Binary search explanation',
        language: 'python',
        mode: 'Explain',
        lastMessageAt: new Date(Date.now() - 259200000),
      },
    ]);

    // 6. Create Connected Repositories (Matching Image 7)
    await Repository.create([
      {
        user: user._id,
        project: p1._id,
        githubRepoId: '101',
        name: 'devreview-platform',
        fullName: 'rohit-dev/devreview-platform',
        owner: { login: 'rohit-dev', avatarUrl: user.avatar },
        defaultBranch: 'main',
        isPrivate: false,
        isConnected: true,
        autoReviewPR: true,
        commentOnPR: true,
        reviewOnPush: false,
      },
      {
        user: user._id,
        project: p2._id,
        githubRepoId: '102',
        name: 'auth-service',
        fullName: 'rohit-dev/auth-service',
        owner: { login: 'rohit-dev', avatarUrl: user.avatar },
        defaultBranch: 'main',
        isPrivate: true,
        isConnected: true,
        autoReviewPR: true,
        commentOnPR: true,
        reviewOnPush: false,
      },
    ]);

    // 7. Create Notifications (Matching Image 3: Recent Activity)
    await Notification.create([
      {
        user: user._id,
        type: 'review_completed',
        title: 'AI review completed for Auth Service',
        message: 'Review completed with overall score 86/100.',
        link: `/reviews/${review._id}`,
        createdAt: new Date(Date.now() - 300000), // 5 min ago
      },
      {
        user: user._id,
        type: 'pr_review_completed',
        title: 'New comment on PR #42',
        message: 'AI Review feedback posted to GitHub pull request #42.',
        link: `/reviews/${review._id}`,
        createdAt: new Date(Date.now() - 1080000), // 18 min ago
      },
      {
        user: user._id,
        type: 'security_issue_detected',
        title: 'Bug detected in user.js',
        message: 'Critical security issue: unindexed query and missing validation.',
        link: '/issues',
        createdAt: new Date(Date.now() - 2100000), // 35 min ago
      },
      {
        user: user._id,
        type: 'system',
        title: 'Created project Alpha',
        message: 'New project workspace configured successfully.',
        link: '/projects',
        createdAt: new Date(Date.now() - 3600000), // 1 hr ago
      },
    ]);

    console.log('[Seed] Demonstration data seeded successfully for Rohit Sharma!');
  } catch (err) {
    console.error('[Seed] Error seeding initial data:', err.message);
  }
};

module.exports = { seedInitialData };
