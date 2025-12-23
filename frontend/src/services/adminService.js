// src/services/adminService.js
import apiClient from './apiClient';
const adminService = {
    // Dashboard stats
    getDashboardStats: async () => {
        const response = await apiClient.get('/admin/dashboard/stats');
        return response.data;
    }, // Recent orders
    getRecentOrders: async (limit = 10) => {
        const response = await apiClient.get('/admin/dashboard/recent-orders', {
            params: { limit },
        });
        return response.data;
    }, // Sales data
    getSalesData: async (period = 'monthly') => {
        const response = await apiClient.get('/admin/dashboard/sales', {
            params: { period },
        });
        return response.data;
    }, // Category sales
    getCategorySales: async () => {
        const response = await apiClient.get('/admin/dashboard/category-sales');
        return response.data;
    }, // System settings
    getSettings: async () => {
        const response = await apiClient.get('/admin/settings');
        return response.data;
    }, // Update settings
    updateSettings: async (settings) => {
        const response = await apiClient.put('/admin/settings', settings);
        return response.data;
    }, // Audit logs
    getAuditLogs: async (params = {}) => {
        const response = await apiClient.get('/admin/audit-logs', { params });
        return response.data;
    },
};
export default adminService;