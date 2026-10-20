const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({ order: Number, title: String, description: String }, { _id: false });

const visaTypeSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // e.g. "Visit Visa", "Work Visa"
    category: { type: String, enum: ['visit', 'work'], default: 'visit' },
    processingDays: { min: Number, max: Number },
    stayDuration: String,
    requiredDocuments: [String],
    steps: [stepSchema],
    visaFeeUSD: Number,
  },
  { _id: false }
);

const countrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    isoNumeric: { type: Number, required: true }, // matches world-atlas feature ids on the map
    isoAlpha3: String,
    region: String,
    visaDifficulty: { type: Number, min: 1, max: 5, required: true }, // 1 easy .. 5 hard
    safetyRating: { type: Number, min: 1, max: 5, required: true }, // 5 safest
    avgMonthlySalaryUSD: Number,
    embassy: { name: String, phone: String, website: String },
    visaTypes: [visaTypeSchema],
    costs: {
      agencyFeeUSD: Number,
      medicalUSD: Number,
      airfareUSD: Number,
      insuranceUSD: Number,
      policeClearanceUSD: Number,
      accommodationPerMonthUSD: Number,
      otherUSD: Number,
    },
    lastVerified: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Country', countrySchema);
