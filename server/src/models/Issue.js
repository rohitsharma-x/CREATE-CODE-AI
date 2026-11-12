const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
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
      index: true,
    },
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      sparse: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'info'],
      default: 'medium',
      index: true,
    },
    category: {
      type: String,
      enum: ['bug', 'security', 'performance', 'maintainability'],
      default: 'bug',
      index: true,
    },
    status: {
      type: String,
      enum: ['open', 'resolved', 'dismissed', 'false_positive'],
      default: 'open',
      index: true,
    },
    file: {
      type: String,
      default: '',
    },
    lineStart: {
      type: Number,
      default: null,
    },
    lineEnd: {
      type: Number,
      default: null,
    },
    suggestedFix: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

issueSchema.index({ user: 1, status: 1, severity: 1 });

module.exports = mongoose.model('Issue', issueSchema);

