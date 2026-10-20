const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    experimentId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    hypothesis: {
      type: String,
      required: false,
    },
    datasetReference: {
      type: String,
      required: true,
    },
    metrics: {
      accuracy: { type: Number, required: false },
      precision: { type: Number, required: false },
      recall: { type: Number, required: false },
      f1Score: { type: Number, required: false },
      latencyMs: { type: Number, required: false },
    },
    tags: [{ type: String }],
    executedBy: {
      type: String,
      default: 'system',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = analysisSchema;
