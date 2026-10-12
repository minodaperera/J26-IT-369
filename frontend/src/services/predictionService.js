import api from './api';

export const predictionService = {
  // Dispatches prediction request to Node backend (which bridges to FastAPI ML service)
  runPrediction: async (payload) => {
    const response = await api.post('/predict', payload);
    return response.data;
  },

  getPredictionHistory: async () => {
    const response = await api.get('/predict/history');
    return response.data;
  },

  getPredictionById: async (id) => {
    const response = await api.get(`/predict/${id}`);
    return response.data;
  },
};
