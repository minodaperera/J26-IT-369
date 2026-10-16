const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const predictRoutes = require('./predictRoutes');
const complaintRoutes = require('./complaints'); // 1. Require complaint routes

// Root health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SafeMaga Express API Backend',
    version: '1.0.0',
  });
});

// Mount module subrouters
router.use('/auth', authRoutes);
router.use('/predict', predictRoutes);
router.use('/complaints', complaintRoutes); // 2. Mount complaint routes under /api/complaints

module.exports = router;