// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://group-16-project.onrender.com' 
    : 'http://localhost:3000');

export const API_BASE_URL = API_URL;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_URL}/api/auth/login`,
    SIGNUP: `${API_URL}/api/auth/signup`,
    LOGOUT: `${API_URL}/api/auth/logout`,
    ME: `${API_URL}/api/auth/me`,
    UPDATE_PROFILE: `${API_URL}/api/auth/updateprofile`,
    UPDATE_PASSWORD: `${API_URL}/api/auth/updatepassword`,
    FORGOT_PASSWORD: `${API_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${API_URL}/api/auth/reset-password`,
    UPLOAD_AVATAR: `${API_URL}/api/auth/upload-avatar`,
  },
  // User endpoints
  USERS: {
    GET_ALL: `${API_URL}/api/users`,
    CREATE: `${API_URL}/api/users`,
    UPDATE: (id) => `${API_URL}/api/users/${id}`,
    DELETE: (id) => `${API_URL}/api/users/${id}`,
  },
};

export default API_BASE_URL;
