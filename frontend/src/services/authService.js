import api from './api';

// Server responses are { success, token?, user }. These helpers return the useful part.
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Returns the user object itself (not the { success, user } envelope).
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  updateProfile: async (payload) => {
    const response = await api.put('/auth/profile', payload);
    return response.data.user;
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};
