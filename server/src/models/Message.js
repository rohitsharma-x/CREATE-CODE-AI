const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    text: {
      type: String,
      default: '',
    },
    code: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: 'javascript',
    },
    mode: {
      type: String,
      default: 'Debug',
    },
    structuredResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ chat: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
