const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    nic: { type: String, required: true, trim: true },
    passportNumber: { type: String, trim: true, default: '' },
    agencyName: { type: String, required: true, trim: true },
    agencyLicenceNo: { type: String, trim: true, default: '' },
    isManualAgency: { type: Boolean, default: false },
    category: {
      type: String,
      required: true,
      enum: [
        'Financial & Fee Disputes',
        'Passport & Document Handling',
        'Service Contract & Promise Breach',
        'Agency Fraud & Scam Practices',
        'Misconduct & Unprofessional Behavior',
        'Other Travel Agency Issues',
      ],
    },
    description: { type: String, required: true, trim: true },
    supportingFiles: [{ type: String }],
    status: {
      type: String,
      enum: ['Submitted', 'Under AI Review', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Submitted',
    },
    aiIntelligence: {
      predictedCategory: { type: String, default: null },
      confidenceScore: { type: Number, default: 0 },
      priorityScore: { type: Number, default: 0 },
      priorityLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium',
      },
      clusterId: { type: String, default: null },
      aiSummary: { type: String, default: '' },
      officerNotes: { type: String, default: '' },
      isOfficerVerified: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);