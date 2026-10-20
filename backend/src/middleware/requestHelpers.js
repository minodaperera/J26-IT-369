const { validationResult } = require('express-validator');

// Runs after express-validator chains; returns the first validation error as a 400.
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

// Lets async route handlers throw; errors reach the shared errorHandler.
exports.asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
