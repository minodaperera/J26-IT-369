// Module 2 API client: the platform's shared axios instance (JWT interceptor, base URL) scoped to /api/guidance.
import api from '@/services/api';

const BASE = '/guidance';
const g = {
  get: (path, config) => api.get(BASE + path, config),
  post: (path, body, config) => api.post(BASE + path, body, config),
  put: (path, body, config) => api.put(BASE + path, body, config),
  delete: (path, config) => api.delete(BASE + path, config),
};

export { errMsg, lkr } from '@/services/apiHelpers';
export default g;
