import axios from 'axios';
import { store } from '../store';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL, headers: {
        'Content-Type': 'application/json',
    }, withCredentials: true,
});
// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const state = store.getState();
        const token = state.auth?.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }, (error) => {
        return Promise.reject(error);
    }
);
// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response, async (error) => {
        const originalRequest = error.config;
        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            // Try to refresh token
            try {
                const refreshToken = store.getState().auth?.refreshToken;
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken,
                    });
                    const { token } = response.data;
                    // Update token in store
                    store.dispatch({ type: 'auth/setToken', payload: token });
                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, redirect to login
                store.dispatch({ type: 'auth/clearCredentials' });
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        // Handle other errors
        if (error.response?.status === 403) {
            console.error('Access denied');
        } else if (error.response?.status === 404) {
            console.error('Resource not found');
        } else if (error.response?.status >= 500) {
            console.error('Server error');
        }
        return Promise.reject(error);
    }
);
export default apiClient;