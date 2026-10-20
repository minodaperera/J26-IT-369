const mongoose = require('mongoose');

// Only extracted metadata is stored. The uploaded file itself is never persisted (privacy requirement).
const documentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    docType: { type: String, enum: ['passport', 'medical', 'police_clearance', 'contract', 'other'], required: true },
    label: String,
    fields: { type: mongoose.Schema.Types.Mixed, default: {} },
    issueDate: Date,
    expiryDate: Date,
    validation: {
      status: { type: String, enum: ['valid', 'warning', 'invalid', 'unverified'], default: 'unverified' },
      issues: [String],
      checks: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    confidence: Number,
    extractionMethod: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserDocument', documentSchema);
