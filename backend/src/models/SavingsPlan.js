const mongoose = require('mongoose');

const savingsPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
    targetAmountLKR: Number,
    currentSavingsLKR: Number,
    months: Number,
    monthlyRequiredLKR: Number,
    targetDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavingsPlan', savingsPlanSchema);
