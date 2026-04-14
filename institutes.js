import { fetchApi } from './client';

export const instituteApi = {
  getAll: () => fetchApi('/institute', { method: 'GET' }),
  getById: (id) => fetchApi(`/institute/${id}`, { method: 'GET' }),
  create: (data) => fetchApi('/institute', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchApi(`/institute/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchApi(`/institute/${id}`, { method: 'DELETE' }),
};

export const departmentApi = {
  getAll: () => fetchApi('/departments', { method: 'GET' }),
  getByInstitute: (instituteId) => fetchApi(`/departments/${instituteId}/departments`, { method: 'GET' }),
  create: (data) => fetchApi('/departments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchApi(`/departments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchApi(`/departments/${id}`, { method: 'DELETE' }),
};
