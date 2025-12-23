import apiClient from './apiClient';

const orderService = {
  // Get user orders
  getOrders: async (params = {}) => {
    const response = await apiClient.get('/orders/my', { params });
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  // Create new order
  createOrder: async (orderData) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id, reason) => {
    const response = await apiClient.post(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  // Track order
  trackOrder: async (orderNumber) => {
    const response = await apiClient.get(`/orders/track/${orderNumber}`);
    return response.data;
  },

  // Download invoice
  downloadInvoice: async (orderId) => {
    const response = await apiClient.get(`/orders/${orderId}/invoice`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${orderId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Return/Refund request
  returnRequest: async (orderId, data) => {
    const response = await apiClient.post(`/orders/${orderId}/return`, data);
    return response.data;
  },

  // Admin: Get all orders
  getAllOrders: async (params = {}) => {
    const response = await apiClient.get('/admin/orders', { params });
    return response.data;
  },

  // Admin: Update order status
  updateOrderStatus: async (id, status, notes) => {
    const response = await apiClient.patch(`/admin/orders/${id}/status`, {
      status,
      notes,
    });
    return response.data;
  },

  // Admin: Update payment status
  updatePaymentStatus: async (id, status) => {
    const response = await apiClient.patch(`/admin/orders/${id}/payment-status`, {
      status,
    });
    return response.data;
  },

  // Admin: Assign order
  assignOrder: async (id, userId) => {
    const response = await apiClient.patch(`/admin/orders/${id}/assign`, {
      assignedTo: userId,
    });
    return response.data;
  },
};

export default orderService;