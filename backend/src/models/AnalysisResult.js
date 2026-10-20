const mongoose = require('mongoose');

const analysisResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    inputQuery: {
      type: String,
      required: [true, 'Input query or payload is required'],
    },
    inferenceOutput: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    modelVersion: {
      type: String,
      default: 'v1.0.0-baseline',
    },
    latencyMs: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'PENDING'],
      default: 'SUCCESS',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AnalysisResult', analysisResultSchema);
