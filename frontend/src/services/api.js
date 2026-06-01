import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || '/api' });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const auth = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  me: () => API.get('/auth/me'),
  updateTone: (tone) => API.patch('/auth/tone', { tone })
};

export const reviews = {
  getAll: (params) => API.get('/reviews', { params }),
  addManual: (data) => API.post('/reviews/manual', data),
  generateDraft: (id) => API.post(`/reviews/${id}/draft`),
  saveReply: (id, replyText) => API.patch(`/reviews/${id}/reply`, { replyText }),
  getStats: () => API.get('/reviews/stats')
};

export const business = {
  updateProfile: (data) => API.patch('/business/profile', data),
  getAlerts: () => API.get('/business/alerts'),
  getFeedback: () => API.get('/business/feedback'),
  getEmbedCode: (userId) => API.get(`/widget/${userId}/embed`)
};

export const billing = {
  checkout: () => API.post('/billing/checkout'),
  portal: () => API.post('/billing/portal')
};

export default API;
