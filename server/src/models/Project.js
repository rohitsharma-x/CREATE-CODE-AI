const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    languages: {
      type: [String],
      default: ['JavaScript'],
    },
    techStack: {
      type: [String],
      default: ['MERN'],
    },
    status: {
      type: String,
      enum: ['Active', 'In Progress', 'Completed', 'On Hold'],
      default: 'Active',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    githubRepo: {
      repoId: String,
      fullName: String,
      defaultBranch: { type: String, default: 'main' },
      url: String,
      connectedAt: Date,
    },
    metrics: {
      reviewsCount: { type: Number, default: 0 },
      bugsCount: { type: Number, default: 0 },
      securityIssuesCount: { type: Number, default: 0 },
      codeQualityScore: { type: Number, default: 85 },
    },
    activity: [
      {
        action: String,
        details: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);

