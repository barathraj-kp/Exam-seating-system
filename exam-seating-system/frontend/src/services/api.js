import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export const departmentAPI = {
  getAll: () => API.get('/departments'),
  create: (data) => API.post('/departments', data),
  delete: (id) => API.delete(`/departments/${id}`)
};

export const hallAPI = {
  getAll: () => API.get('/halls'),
  getOne: (id) => API.get(`/halls/${id}`),
  create: (data) => API.post('/halls', data),
  update: (id, data) => API.put(`/halls/${id}`, data),
  delete: (id) => API.delete(`/halls/${id}`)
};

export const studentAPI = {
  getAll: (params) => API.get('/students', { params }),
  getOne: (id) => API.get(`/students/${id}`),
  create: (data) => API.post('/students', data),
  update: (id, data) => API.put(`/students/${id}`, data),
  delete: (id) => API.delete(`/students/${id}`)
};

export const examAPI = {
  getAll: () => API.get('/exams'),
  getOne: (id) => API.get(`/exams/${id}`),
  create: (data) => API.post('/exams', data),
  update: (id, data) => API.put(`/exams/${id}`, data),
  delete: (id) => API.delete(`/exams/${id}`)
};

export const seatingAPI = {
  getByExam: (examId) => API.get(`/seating/exam/${examId}`),
  getByHall: (examId, hallId) => API.get(`/seating/exam/${examId}/hall/${hallId}`),
  generate: (data) => API.post('/seating/generate', data),
  assign: (data) => API.post('/seating/assign', data),
  delete: (examId) => API.delete(`/seating/exam/${examId}`),
  search: (params) => API.get('/seating/search', { params })
};
