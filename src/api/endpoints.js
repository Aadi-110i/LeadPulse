import { apiRequest, buildQuery } from './client';

/** Every server endpoint the app talks to, in one place. */
export const api = {
  health: () => apiRequest('/api/health'),

  signIn: (payload) => apiRequest('/api/auth/signin', { method: 'POST', body: payload }),
  signUp: (payload) => apiRequest('/api/auth/signup', { method: 'POST', body: payload }),
  me: () => apiRequest('/api/auth/me'),
  demoAccount: () => apiRequest('/api/auth/demo'),

  leads: (params) => apiRequest(`/api/leads${buildQuery(params)}`),
  lead: (id) => apiRequest(`/api/leads/${id}`),
  updateLeadStatus: (id, status) => apiRequest(`/api/leads/${id}`, { method: 'PATCH', body: { status } }),

  calls: (params) => apiRequest(`/api/calls${buildQuery(params)}`),
  createCall: (payload) => apiRequest('/api/calls', { method: 'POST', body: payload }),

  stats: () => apiRequest('/api/stats'),
  activity: (params) => apiRequest(`/api/stats/activity${buildQuery(params)}`),
  observability: () => apiRequest('/api/stats/observability'),

  webhookEvents: () => apiRequest('/api/webhooks/events'),
};

export default api;
