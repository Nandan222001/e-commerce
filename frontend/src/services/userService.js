import apiClient from './apiClient';
const userService = {
    // Get all users (admin)
    getUsers: async (params = {}) => {
        const response = await apiClient.get('/admin/users', { params });
        return response.data;
    }, // Get user by ID
    getUserById: async (id) => {
        const response = await apiClient.get(`/admin/users/${id}`);
        return response.data;
    }, // Update user
    updateUser: async (id, userData) => {
        const response = await apiClient.put(`/admin/users/${id}`, userData);
        return response.data;
    }, // Delete user
    deleteUser: async (id) => {
        const response = await apiClient.delete(`/admin/users/${id}`);
        return response.data;
    }, // Toggle user status
    toggleUserStatus: async (id) => {
        const response = await apiClient.patch(`/admin/users/${id}/toggle-status`);
        return response.data;
    }, // Get current user profile
    getProfile: async () => {
        const response = await apiClient.get('/users/profile');
        return response.data;
    }, // Update profile
    updateProfile: async (profileData) => {
        const response = await apiClient.put('/users/profile', profileData);
        return response.data;
    }, // Upload avatar
    uploadAvatar: async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await apiClient.post('/users/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};
export default userService;