const mongoose = require('mongoose');

// Document requirements per destination, seeded from the cleaned requirements dataset
// (ai-ml/data/raw/comprehensive_visa_doc_dataset.csv -> database/seeds/guidance/requirements.json).
const categorySchema = new mongoose.Schema(
  {
    order: Number,
    category: String, // Visa / Entry Permit | Standard Identity Papers | Financial Support | Health & Vaccinations | Accommodation & Itinerary
    requirements: {
      traveler: String,
      medical: String,
      business: String,
      student: String,
      child: String,
    },
  },
  { _id: false }
);

const docRequirementSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    passportType: String,
    entryType: String, // E-Visa (Online) | Embassy Visa | Embassy Visa / Electronic Travel Authorization
    biometrics: Boolean,
    interview: Boolean,
    notes: [String],
    categories: [categorySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('DocRequirement', docRequirementSchema);
