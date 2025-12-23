import apiClient from './apiClient';
const financeService = {
    // Get finance dashboard stats
    getStats: async () => {
        const response = await apiClient.get('/finance/stats');
        return response.data;
    }, // Get revenue data
    getRevenueData: async (period = 'monthly') => {
        const response = await apiClient.get('/finance/revenue', {
            params: { period },
        });
        return response.data;
    }, // Get pending invoices
    getPendingInvoices: async () => {
        const response = await apiClient.get('/finance/invoices/pending');
        return response.data;
    }, // Get all invoices
    getInvoices: async (params = {}) => {
        const response = await apiClient.get('/finance/invoices', { params });
        return response.data;
    }, // Get invoice by ID
    getInvoiceById: async (id) => {
        const response = await apiClient.get(`/finance/invoices/${id}`);
        return response.data;
    }, // Create invoice
    createInvoice: async (invoiceData) => {
        const response = await apiClient.post('/finance/invoices', invoiceData);
        return response.data;
    }, // Update invoice
    updateInvoice: async (id, invoiceData) => {
        const response = await apiClient.put(`/finance/invoices/${id}`, invoiceData);
        return response.data;
    }, // Send invoice
    sendInvoice: async (id, email) => {
        const response = await apiClient.post(`/finance/invoices/${id}/send`, { email });
        return response.data;
    }, // Mark invoice as paid
    markInvoiceAsPaid: async (id) => {
        const response = await apiClient.patch(`/finance/invoices/${id}/mark-paid`);
        return response.data;
    }, // Get tax report
    getTaxReport: async (startDate, endDate) => {
        const response = await apiClient.get('/finance/reports/tax', {
            params: { startDate, endDate },
        });
        return response.data;
    }, // Get sales report
    getSalesReport: async (startDate, endDate) => {
        const response = await apiClient.get('/finance/reports/sales', {
            params: { startDate, endDate },
        });
        return response.data;
    }, // Export financial report
    exportReport: async (type, params = {}) => {
        const response = await apiClient.get(`/finance/reports/${type}/export`, {
            params, responseType: 'blob',
        });
        return response.data;
    },
};
export default financeService;