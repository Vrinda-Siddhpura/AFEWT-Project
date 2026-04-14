import { fetchApi } from './client';

export const eventApi = {
  getAll: () => fetchApi('/events', { method: 'GET' }),
  getByDepartment: (id) => fetchApi(`/events/${id}/events`, { method: 'GET' }),
  getById: (id) => fetchApi(`/events/${id}`, { method: 'GET' }),
  create: (data) => fetchApi('/events', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchApi(`/events/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchApi(`/events/${id}`, { method: 'DELETE' }),
  
  // Groups per event
  getGroups: (id) => fetchApi(`/events/${id}/groups`, { method: 'GET' }),
  createGroup: (id, data) => fetchApi(`/events/${id}/groups`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Winners per event
  getWinners: (id) => fetchApi(`/events/${id}/winners`, { method: 'GET' }),
  declareWinner: (id, data) => fetchApi(`/events/${id}/winners`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export const groupApi = {
  getById: (id) => fetchApi(`/groups/${id}`, { method: 'GET' }),
  update: (id, data) => fetchApi(`/groups/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchApi(`/groups/${id}`, { method: 'DELETE' }),

  getParticipants: (id) => fetchApi(`/groups/${id}/participants`, { method: 'GET' }),
  addParticipant: (id, data) => fetchApi(`/groups/${id}/participants`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export const participantApi = {
  update: (id, data) => fetchApi(`/participants/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchApi(`/participants/${id}`, { method: 'DELETE' }),
};

export const winnerApi = {
  update: (id, data) => fetchApi(`/winners/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchApi(`/winners/${id}`, { method: 'DELETE' }),
};
