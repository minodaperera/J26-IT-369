const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      // 'user' = public traveller account; researcher/engineer/lead = project team; admin = platform admin
      enum: ['user', 'researcher', 'engineer', 'lead', 'admin'],
      default: 'user',
    },
    // --- Shared preference (all modules) ---
    language: { type: String, enum: ['en', 'si', 'ta'], default: 'en' },
    // --- Module 2 (Legal, Documents & Costs): profile used by the visa approval-risk predictor ---
    profile: {
      age: Number,
      monthlyIncomeLKR: Number,
      savingsLKR: Number,
      employment: { type: String, enum: ['employed', 'self_employed', 'student', 'unemployed'], default: 'employed' },
      travelHistoryCount: { type: Number, default: 0 },
      previousRejections: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
