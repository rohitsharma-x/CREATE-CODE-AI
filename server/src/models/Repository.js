const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema(
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
    githubRepoId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    owner: {
      login: String,
      avatarUrl: String,
    },
    defaultBranch: {
      type: String,
      default: 'main',
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    url: {
      type: String,
      default: '',
    },
    isConnected: {
      type: Boolean,
      default: true,
    },
    autoReviewPR: {
      type: Boolean,
      default: true,
    },
    commentOnPR: {
      type: Boolean,
      default: true,
    },
    reviewOnPush: {
      type: Boolean,
      default: false,
    },
    webhookId: {
      type: String,
    },
    lastReviewAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

repositorySchema.index({ user: 1, fullName: 1 }, { unique: true });

module.exports = mongoose.model('Repository', repositorySchema);

