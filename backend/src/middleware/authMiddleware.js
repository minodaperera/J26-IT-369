const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'safemaga_super_secret_jwt_key_change_in_production'
      );
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: token verification failed',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: no token provided',
    });
  }
};

// Use AFTER protect. Reads the role from the database (not the token) so a demoted admin loses access at once.
const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user && req.user.id).select('role');
    if (user && user.role === 'admin') return next();
    return res.status(403).json({ success: false, message: 'Admin access required' });
  } catch (error) {
    next(error);
  }
};

module.exports = { protect, adminOnly };
