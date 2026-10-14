const mongoose = require('mongoose');

const AgencySchema = new mongoose.Schema({
  agencyName: { type: String, required: true },
  licenseNo: { type: String, required: true },
  address: { type: String, required: true },
  district: { type: String },
  telephone: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
});

module.exports = mongoose.model('Agency', AgencySchema);