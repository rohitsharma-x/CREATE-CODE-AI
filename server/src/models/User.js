const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    bio: {
      type: String,
      default: 'Full-stack developer | MERN | Open Source',
    },
    preferredLanguages: {
      type: [String],
      default: ['JavaScript', 'Python', 'C++'],
    },
    role: {
      type: String,
      enum: ['developer', 'admin'],
      default: 'developer',
    },
    googleId: {
      type: String,
      sparse: true,
    },
    githubId: {
      type: String,
      sparse: true,
    },
    githubUsername: {
      type: String,
    },
    githubAccessTokenEncrypted: {
      type: String,
    },
    githubConnectedAt: {
      type: Date,
    },
    githubSettings: {
      autoReviewPR: { type: Boolean, default: true },
      commentOnPR: { type: Boolean, default: true },
      reviewOnPush: { type: Boolean, default: false },
    },
    themePreference: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark',
    },
    defaultLanguage: {
      type: String,
      default: 'javascript',
    },
    defaultAiMode: {
      type: String,
      default: 'Debug',
    },
    notificationPreferences: {
      reviewCompleted: { type: Boolean, default: true },
      prReviewCompleted: { type: Boolean, default: true },
      securityAlerts: { type: Boolean, default: true },
      codeExecutionCompleted: { type: Boolean, default: true },
    },
    apiUsage: {
      aiRequests: { type: Number, default: 0 },
      codeExecutions: { type: Number, default: 0 },
      reviewsCount: { type: Number, default: 0 },
      limits: {
        aiRequests: { type: Number, default: 500 },
        codeExecutions: { type: Number, default: 200 },
        reviewsCount: { type: Number, default: 100 },
      },
    },
    activeSessions: [
      {
        token: String,
        userAgent: String,
        ip: String,
        lastActive: { type: Date, default: Date.now },
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.githubAccessTokenEncrypted;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

