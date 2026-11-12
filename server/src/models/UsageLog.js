const mongoose = require('mongoose');

const usageLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actionType: {
      type: String,
      enum: ['ai_chat', 'code_review', 'code_execution', 'pr_review'],
      required: true,
    },
    language: {
      type: String,
      default: 'javascript',
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
    executionTimeMs: {
      type: Number,
      default: 0,
    },
    success: {
      type: Boolean,
      default: true,
    },
    errorMessage: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

usageLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('UsageLog', usageLogSchema);

