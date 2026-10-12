const aiService = require('../services/aiService');
const AnalysisResult = require('../models/AnalysisResult');

// @desc    Send input to AI model and persist result
// @route   POST /api/predict
// @access  Public (or protected if token attached)
const executePrediction = async (req, res, next) => {
  try {
    const { input, parameters } = req.body;

    if (!input) {
      return res.status(400).json({ success: false, message: 'Please provide an input string or dataset payload' });
    }

    const aiResponse = await aiService.getPrediction({ input, parameters });

    // Persist to MongoDB if database connection is available
    let savedRecord = null;
    try {
      savedRecord = await AnalysisResult.create({
        userId: req.user ? req.user.id : null,
        inputQuery: input,
        inferenceOutput: aiResponse.data,
        modelVersion: aiResponse.data.modelVersion || 'v1.0.0',
        latencyMs: aiResponse.latencyMs,
        status: 'SUCCESS',
      });
    } catch (dbError) {
      console.warn(`[Warning] Could not persist prediction result to DB: ${dbError.message}`);
    }

    res.json({
      success: true,
      data: aiResponse.data,
      latencyMs: aiResponse.latencyMs,
      persistedId: savedRecord ? savedRecord._id : null,
      isMock: aiResponse.isMock || false,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get historical predictions
// @route   GET /api/predict/history
// @access  Public
const getPredictionHistory = async (req, res, next) => {
  try {
    const query = req.user ? { userId: req.user.id } : {};
    const results = await AnalysisResult.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI Bridge health status
// @route   GET /api/predict/status
// @access  Public
const getBridgeStatus = async (req, res, next) => {
  try {
    const status = await aiService.checkHealth();
    res.json({
      success: true,
      aiBridge: status,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  executePrediction,
  getPredictionHistory,
  getBridgeStatus,
};
