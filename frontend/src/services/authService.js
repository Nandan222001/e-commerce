import apiClient from './apiClient';
const authService = {
    login: async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password });
        return response;
    }, register: async (userData) => {
        const response = await apiClient.post('/auth/register', userData);
        return response;
    },
    logout: async () => {
        const response = await apiClient.post('/auth/logout');
        return response;
    }, refreshToken: async () => {
        const response = await apiClient.post('/auth/refresh');
        return response;
    }, forgotPassword: async (email) => {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response;
    }, resetPassword: async (token, password) => {
        const response = await apiClient.post('/auth/reset-password', { token, password });
        return response;
    }, verifyEmail: async (token) => {
        const response = await apiClient.post('/auth/verify-email', { token });
        return response;
    }, changePassword: async (currentPassword, newPassword) => {
        const response = await apiClient.post('/auth/change-password', {
            currentPassword, newPassword,
        });
        return response;
    },
};
export default authService;