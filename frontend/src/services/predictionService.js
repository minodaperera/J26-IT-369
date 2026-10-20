import api from './api';
import axios from 'axios';

// Known calibrated domain benchmarks from Step 6 & 7 of the SafeMaga ML pipeline
export const VISA_DOMAIN_DATA = {
  destinations: [
    { country: 'USA', flag: '🇺🇸', minBalanceLkr: 1800000, region: 'Americas' },
    { country: 'UK', flag: '🇬🇧', minBalanceLkr: 1200000, region: 'Europe' },
    { country: 'Australia', flag: '🇦🇺', minBalanceLkr: 1000000, region: 'Oceania' },
    { country: 'Canada', flag: '🇨🇦', minBalanceLkr: 890000, region: 'Americas' },
    { country: 'Italy', flag: '🇮🇹', minBalanceLkr: 800000, region: 'Europe' },
    { country: 'China', flag: '🇨🇳', minBalanceLkr: 550000, region: 'Asia' },
    { country: 'Germany', flag: '🇩🇪', minBalanceLkr: 500000, region: 'Europe' },
    { country: 'France', flag: '🇫🇷', minBalanceLkr: 500000, region: 'Europe' },
    { country: 'South Korea', flag: '🇰🇷', minBalanceLkr: 450000, region: 'Asia' },
    { country: 'Japan', flag: '🇯🇵', minBalanceLkr: 400000, region: 'Asia' },
    { country: 'Turkey', flag: '🇹🇷', minBalanceLkr: 350000, region: 'Eurasia' },
    { country: 'UAE', flag: '🇦🇪', minBalanceLkr: 300000, region: 'Middle East' },
    { country: 'South Africa', flag: '🇿🇦', minBalanceLkr: 300000, region: 'Africa' },
    { country: 'Malaysia', flag: '🇲🇾', minBalanceLkr: 250000, region: 'Asia' },
    { country: 'New Zealand', flag: '🇳🇿', minBalanceLkr: 185000, region: 'Oceania' },
    { country: 'India', flag: '🇮🇳', minBalanceLkr: 100000, region: 'Asia' },
  ],
  migrationTypes: [
    { id: 'first_time', label: 'First-Time Applicant', desc: 'No prior migration or foreign visa records' },
    { id: 'repeat', label: 'Repeat Applicant', desc: 'Prior travel, renewal, or past migration history' },
  ],
  seasonalMonths: [1, 4, 8, 12], // Jan, Apr, Aug, Dec
  validAgeRange: { min: 18, max: 69 },
};

// Create axios instance for FastAPI microservice via Vite proxy
const fastApiDirect = axios.create({
  baseURL: '/fastapi',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const predictionService = {
  /**
   * Dispatches prediction to FastAPI directly or through Node.js Express Gateway
   * @param {Object} payload { applicant_age, available_bank_balance_lkr, destination, migration_type, document_submitted_date }
   * @param {string} mode 'auto' | 'direct' | 'gateway'
   */
  predictVisaTime: async (payload, mode = 'auto') => {
    const startTime = performance.now();

    // 1. DIRECT FASTAPI INFERENCE (Port 8000)
    if (mode === 'direct') {
      try {
        const res = await fastApiDirect.post('/api/v1/visa/predict', payload);
        const duration = Math.round(performance.now() - startTime);
        return {
          ...res.data,
          source: 'FastAPI Microservice (Direct)',
          latencyMs: duration,
        };
      } catch (err) {
        // Fallback to Vite proxy /fastapi if direct fails due to network/browser restrictions
        const proxyRes = await axios.post('/fastapi/api/v1/visa/predict', payload);
        const duration = Math.round(performance.now() - startTime);
        return {
          ...proxyRes.data,
          source: 'FastAPI Microservice (Vite Proxy)',
          latencyMs: duration,
        };
      }
    }

    // 2. NODE.JS EXPRESS GATEWAY (Port 5000 -> Port 8000)
    if (mode === 'gateway') {
      const res = await api.post('/predict', { input: payload });
      const duration = Math.round(performance.now() - startTime);
      return {
        ...(res.data.data || res.data),
        source: 'Node.js Express Gateway',
        latencyMs: res.data.latencyMs || duration,
        isMock: res.data.isMock || false,
      };
    }

    // 3. AUTO-FAILOVER: Try Direct FastAPI first, then fallback to Node Gateway
    try {
      const res = await fastApiDirect.post('/api/v1/visa/predict', payload);
      const duration = Math.round(performance.now() - startTime);
      return {
        ...res.data,
        source: 'FastAPI Microservice (Direct)',
        latencyMs: duration,
      };
    } catch (directErr) {
      console.warn('[Prediction Service] Direct FastAPI call failed, attempting Node Gateway...', directErr.message);
      try {
        const gwRes = await api.post('/predict', { input: payload });
        const duration = Math.round(performance.now() - startTime);
        return {
          ...(gwRes.data.data || gwRes.data),
          source: 'Node.js Express Gateway (Auto-fallback)',
          latencyMs: gwRes.data.latencyMs || duration,
          isMock: gwRes.data.isMock || false,
        };
      } catch (gwErr) {
        // If both failed, surface the most relevant error
        const errMsg = directErr.response?.data?.detail || gwErr.response?.data?.message || directErr.message;
        throw new Error(errMsg);
      }
    }
  },

  /**
   * Health checks for both FastAPI ML bridge and Express Backend
   */
  checkHealth: async () => {
    const results = {
      fastapi: { online: false, details: null, latency: 0 },
      express: { online: false, details: null, latency: 0 },
    };

    // Check FastAPI
    const t0 = performance.now();
    try {
      const res = await fastApiDirect.get('/health', { timeout: 3000 });
      results.fastapi = {
        online: true,
        details: res.data,
        latency: Math.round(performance.now() - t0),
      };
    } catch (e) {
      results.fastapi = { online: false, error: e.message, latency: Math.round(performance.now() - t0) };
    }

    // Check Express
    const t1 = performance.now();
    try {
      const res = await api.get('/predict/status', { timeout: 3000 });
      results.express = {
        online: true,
        details: res.data,
        latency: Math.round(performance.now() - t1),
      };
    } catch (e) {
      results.express = { online: false, error: e.message, latency: Math.round(performance.now() - t1) };
    }

    return results;
  },

  /**
   * Fetches metadata from model microservice
   */
  getMetadata: async () => {
    try {
      const res = await fastApiDirect.get('/api/v1/visa/metadata', { timeout: 4000 });
      return res.data;
    } catch {
      return VISA_DOMAIN_DATA;
    }
  },

  /**
   * Legacy runPrediction method for backward compatibility
   */
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
