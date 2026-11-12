const mongoose = require('mongoose');

const findingSchema = new mongoose.Schema({
  file: { type: String, default: 'snippet.js' },
  lineStart: { type: Number, default: 1 },
  lineEnd: { type: Number, default: 1 },
  category: {
    type: String,
    enum: ['bug', 'security', 'performance', 'maintainability', 'optimization'],
    default: 'bug',
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    default: 'medium',
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  suggestion: { type: String, default: '' },
  suggestedCode: { type: String, default: '' },
});

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      sparse: true,
    },
    reviewNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    reviewType: {
      type: String,
      enum: ['snippet', 'file', 'archive', 'pr', 'repo'],
      default: 'snippet',
    },
    repository: {
      type: String,
      default: '',
    },
    prNumber: {
      type: Number,
    },
    prTitle: {
      type: String,
    },
    branch: {
      base: { type: String, default: 'main' },
      head: { type: String, default: 'feature' },
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'completed',
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 85,
    },
    metrics: {
      codeQuality: { type: Number, default: 88 },
      security: { type: Number, default: 80 },
      performance: { type: Number, default: 85 },
      maintainability: { type: Number, default: 90 },
    },
    summary: {
      bugsCount: { type: Number, default: 0 },
      securityCount: { type: Number, default: 0 },
      improvementsCount: { type: Number, default: 0 },
      optimizationsCount: { type: Number, default: 0 },
      overview: { type: String, default: '' },
    },
    findings: [findingSchema],
    filesChanged: [
      {
        filename: String,
        status: { type: String, default: 'modified' },
        additions: { type: Number, default: 0 },
        deletions: { type: Number, default: 0 },
        patch: String,
      },
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        authorName: String,
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    rawCode: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: 'javascript',
    },
    optimizedCode: {
      type: String,
      default: '',
    },
    complexityComparison: {
      originalTime: { type: String, default: 'O(N)' },
      optimizedTime: { type: String, default: 'O(N)' },
      originalSpace: { type: String, default: 'O(1)' },
      optimizedSpace: { type: String, default: 'O(1)' },
      explanation: { type: String, default: '' },
    },
    optimizationSuggestions: [{ type: String }],
    isAlreadyOptimal: {
      type: Boolean,
      default: false,
    },
    optimalExplanation: {
      type: String,
      default: '',
    },
    testCases: [
      {
        input: String,
        expectedOutput: String,
        description: String,
        type: { type: String, default: 'normal' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);

