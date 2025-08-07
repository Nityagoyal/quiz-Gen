const mongoose = require('mongoose');

const coinFlipSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  result: {
    type: String,
    enum: ['Heads', 'Tails'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  // Quantum-specific fields
  quantum: {
    type: Boolean,
    default: false
  },
  batchId: {
    type: String,
    index: true
  },
  sessionId: String,
  privacyPreserved: {
    type: Boolean,
    default: false
  },
  circuitDepth: {
    type: Number,
    default: 1
  },
  gateCount: {
    type: Number,
    default: 1
  }
});

// Compound index for efficient user-specific queries
coinFlipSchema.index({ userId: 1, timestamp: -1 });
coinFlipSchema.index({ quantum: 1, userId: 1 });

module.exports = mongoose.model('CoinFlip', coinFlipSchema);
