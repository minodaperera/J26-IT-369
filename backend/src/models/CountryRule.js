const mongoose = require('mongoose');

const CountryRuleSchema = new mongoose.Schema({
  country: { type: String, required: true, unique: true },
  validity_min_days: { type: Number, required: true },
  validity_basis: { type: String, enum: ['arrival', 'departure', 'stay_end'], required: true },
  blank_pages_min: { type: Number, required: true, default: 2 },
  visa_required: { type: Boolean, required: true, default: true },
  visa_type: { type: String, required: true },
  key_notices: { type: String },
});

module.exports = mongoose.model('CountryRule', CountryRuleSchema);