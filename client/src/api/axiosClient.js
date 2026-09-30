import axios from 'axios';

const axiosClient = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, ''),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mota_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/login')) {
      // Token expired or invalid
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('mota_token');
        localStorage.removeItem('mota_user');
        window.dispatchEvent(new Event('mota:unauthorized'));
      }
    }
    if (!error.response) {
      error.response = { data: { message: error.code === 'ECONNABORTED' ? 'The request timed out. Please try again.' : 'Cannot reach the scholarship API. Check that the backend is running.' } };
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
