const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema(
  {
    deliveryId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    event: {
      type: String,
      required: true,
    },
    repository: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
    },
    action: {
      type: String,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'ignored'],
      default: 'pending',
    },
    errorMessage: {
      type: String,
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WebhookEvent', webhookEventSchema);

