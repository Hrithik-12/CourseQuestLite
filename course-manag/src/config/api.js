// src/config/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  COURSES: `${API_BASE_URL}/api/courses`,
  COMPARE: `${API_BASE_URL}/api/compare`,
  ASK: `${API_BASE_URL}/api/ask`,
  INGEST: `${API_BASE_URL}/api/ingest`,
  IMPORT_CSV: `${API_BASE_URL}/api/import/csv`,
  HEALTH: `${API_BASE_URL}/health`
};

export default API_BASE_URL;