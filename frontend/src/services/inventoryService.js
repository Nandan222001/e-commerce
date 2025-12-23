import apiClient from './apiClient';
const inventoryService = {
    // Get inventory stats
    getStats: async () => {
        const response = await apiClient.get('/admin/inventory/stats');
        return response.data;
    }, // Get low stock items
    getLowStock: async () => {
        const response = await apiClient.get('/admin/inventory/low-stock');
        return response.data;
    }, // Get inventory movements
    getMovements: async (params = {}) => {
        const response = await apiClient.get('/admin/inventory/movements', { params });
        return response.data;
    }, // Adjust stock
    adjustStock: async (productId, adjustment) => {
        const response = await apiClient.post('/admin/inventory/adjust', {
            productId, adjustment,
        });
        return response.data;
    }, // Get stock history
    getStockHistory: async (productId) => {
        const response = await apiClient.get(`/admin/inventory/history/${productId}`);
        return response.data;
    }, // Export inventory report
    exportReport: async (params = {}) => {
        const response = await apiClient.get('/admin/inventory/export', {
            params, responseType: 'blob',
        });
        return response.data;
    },
};
export default inventoryService;