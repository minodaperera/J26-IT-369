const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

const aiService = {
  /**
   * Dispatches input data to the Python FastAPI bridge for inference.
   * @param {Object} payload - { input: string, parameters?: Object }
   * @returns {Promise<Object>} prediction response
   */
  getPrediction: async (payload) => {
    const startTime = Date.now();
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/predict`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });

      const latencyMs = Date.now() - startTime;
      return {
        success: true,
        data: response.data,
        latencyMs,
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      console.error(`[AI Bridge Error] Failed to communicate with FastAPI: ${error.message}`);
      
      // If AI bridge service is down during initial development/testing, return simulated fallback
      if (error.code === 'ECONNREFUSED' || error.response?.status === 502) {
        return {
          success: true,
          isMock: true,
          latencyMs,
          data: {
            prediction: 'Simulated classification output (FastAPI bridge service offline)',
            confidence: 0.942,
            modelVersion: 'v1.0.0-mock',
            inputEcho: payload.input,
          },
        };
      }

      throw new Error(`AI inference service error: ${error.response?.data?.detail || error.message}`);
    }
  },

  /**
   * Health check to test connectivity with FastAPI bridge.
   */
  checkHealth: async () => {
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 3000 });
      return response.data;
    } catch (error) {
      return { status: 'unreachable', error: error.message };
    }
  },
};

module.exports = aiService;
