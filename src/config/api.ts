const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD 
    ? 'https://trinity-jobs.onrender.com' // Your deployed backend
    : 'http://localhost:5000');

export const API_ENDPOINTS = {
  JOBS: `${API_BASE_URL}/api/jobs`,
  USERS: `${API_BASE_URL}/api/users`,
  APPLICATIONS: `${API_BASE_URL}/api/applications`,
  COMPANIES: `${API_BASE_URL}/api/companies`,
  AUTH: `${API_BASE_URL}/api/auth`,
  BASE_URL: API_BASE_URL
};