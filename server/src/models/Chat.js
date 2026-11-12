const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
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
    title: {
      type: String,
      default: 'New Chat',
      trim: true,
    },
    language: {
      type: String,
      default: 'javascript',
    },
    mode: {
      type: String,
      enum: [
        'Debug',
        'Optimize',
        'Explain',
        'Security',
        'Complexity Analysis',
        'Code Conversion',
        'Generate Test Cases',
      ],
      default: 'Debug',
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

chatSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);

