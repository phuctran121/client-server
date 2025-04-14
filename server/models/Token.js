const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  type: { type: String, enum: ['access', 'refresh'], required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create index for auto-deletion of expired tokens
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Token', tokenSchema); 