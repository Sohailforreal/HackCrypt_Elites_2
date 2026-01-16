import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Student APIs
export const studentAPI = {
  register: (data) => apiClient.post('/students/register', data),
  getAll: () => apiClient.get('/students/all'),
  getById: (id) => apiClient.get(`/students/${id}`),
  storeBiometric: (studentId, data) =>
    apiClient.post(`/students/biometric/${studentId}`, data),
};

// Attendance APIs
export const attendanceAPI = {
  verify: (data) => apiClient.post('/attendance/verify', data),
  getByStudent: (studentId) =>
    apiClient.get(`/attendance/student/${studentId}`),
  getAll: (filters) => apiClient.get('/attendance', { params: filters }),
};

// Session APIs
export const sessionAPI = {
  start: (data) => apiClient.post('/sessions/start', data),
  stop: (id) => apiClient.post(`/sessions/stop/${id}`),
  getActive: () => apiClient.get('/sessions/active'),
};

// Auth Flow APIs (Temp Cache)
export const authFlowAPI = {
  start: (data) => apiClient.post('/auth-flow/start', data),
  verifyFingerprint: (data) => apiClient.post('/auth-flow/verify-fingerprint', data),
  verifyFace: (data) => apiClient.post('/auth-flow/verify-face', data),
  finalize: (data) => apiClient.post('/auth-flow/finalize', data),
};

export default apiClient;
