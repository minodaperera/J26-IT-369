const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['lead', 'engineer', 'researcher', 'reviewer'],
      default: 'researcher',
    },
    assignedSubsystem: {
      type: String,
      enum: ['frontend', 'backend', 'ai-ml', 'database'],
      default: 'ai-ml',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = userSchema;
