const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
    input: mongoose.Schema.Types.Mixed,
    approvalProbability: Number,
    riskLevel: String,
    weakPoints: [mongoose.Schema.Types.Mixed],
  },
  { timestamps: true }
);

module.exports = mongoose.model('RiskPrediction', predictionSchema);
