/**
 * HTTP client configuration
 * Axios instance with interceptors for error handling
 */
import axios from 'axios';
import { REQUEST_TIMEOUT } from '../config/constants';

/**
 * Create axios instance with default configuration
 */
const http = axios.create({
    timeout: REQUEST_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Response interceptor for error handling
 * Extracts error details and formats error message
 */
http.interceptors.response.use(
    (response) => response,
    (err) => {
        const status = err.response?.status;
        const detail = err.response?.data?.detail || err.message || 'Request failed';
        return Promise.reject(new Error(detail + (status ? ` (HTTP ${status})` : '')));
    }
);

export default http;
