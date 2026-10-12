const express = require('express');
const router = express.Router();
const {
  executePrediction,
  getPredictionHistory,
  getBridgeStatus,
} = require('../controllers/predictController');

router.post('/', executePrediction);
router.get('/history', getPredictionHistory);
router.get('/status', getBridgeStatus);

module.exports = router;
