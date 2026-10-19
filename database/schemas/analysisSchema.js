/**
 * Experiment / analysis log schema used by the standalone seed tooling (seeds/sampleData.json -> "analyses").
 */
const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    experimentId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    hypothesis: String,
    datasetReference: String,
    metrics: {
      accuracy: Number,
      precision: Number,
      recall: Number,
      f1Score: Number,
      latencyMs: Number,
    },
    tags: [String],
    executedBy: String,
  },
  { timestamps: true }
);

module.exports = analysisSchema;
