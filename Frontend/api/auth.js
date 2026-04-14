import { fetchApi } from './client';

export const authApi = {
  register: (userData) => fetchApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  login: (credentials) => fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  me: () => fetchApi('/auth/me', {
    method: 'GET',
  }),

  // Add a generic logout function if the API ever adds it,
  // or clear state on the frontend for now
};

export const userApi = {
  getAll: () => fetchApi('/users', { method: 'GET' }),
  getById: (id) => fetchApi(`/users/${id}`, { method: 'GET' }),
  update: (id, data) => fetchApi(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchApi(`/users/${id}`, { method: 'DELETE' }),
};
