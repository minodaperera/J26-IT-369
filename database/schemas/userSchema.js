/**
 * User schema used by the standalone seed tooling.
 * Keep in sync with backend/src/models/User.js (the API's source of truth).
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['user', 'researcher', 'engineer', 'lead', 'admin'], default: 'user' },
    assignedSubsystem: { type: String }, // team-member seed data: backend | frontend | ai-ml | database
    language: { type: String, enum: ['en', 'si', 'ta'], default: 'en' },
    profile: {
      age: Number,
      monthlyIncomeLKR: Number,
      savingsLKR: Number,
      employment: { type: String, enum: ['employed', 'self_employed', 'student', 'unemployed'], default: 'employed' },
      travelHistoryCount: { type: Number, default: 0 },
      previousRejections: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = userSchema;
