import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const notesApi = {
  getAll: () => api.get('/notes/'),
  getOne: (id) => api.get(`/notes/${id}/`),
  create: (data) => api.post('/notes/', data),
  update: (id, data) => api.put(`/notes/${id}/`, data),
  delete: (id) => api.delete(`/notes/${id}/`),
  uploadFile: (id, file) => {
    const formData = new FormData();
    formData.append('attachment', file);
    return api.post(`/notes/${id}/upload/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
