import axios from 'axios';

const http = axios.create({
  timeout: 30000,
});

http.interceptors.response.use(
  (response) => response,
  (err) => {
    const status = err.response?.status;
    const detail = err.response?.data?.detail || err.message || 'Request failed';
    return Promise.reject(new Error(detail + (status ? ` (HTTP ${status})` : '')));
  }
);

export default http;

