// src/services/productService.js
import apiClient from './apiClient';
const productService = {
    // Get all products with filters
    getProducts: async (params = {}) => {
        const response = await apiClient.get('/products', { params });
        return response.data;
    }, // Get product by ID
    getProductById: async (id) => {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
    }, // Search products
    searchProducts: async (searchTerm, filters = {}) => {
        const response = await apiClient.get('/products/search', {
            params: { q: searchTerm, ...filters },
        });
        return response.data;
    }, // Get featured products
    getFeaturedProducts: async () => {
        const response = await apiClient.get('/products/featured');
        return response.data;
    },
    // Get new arrivals
    getNewArrivals: async () => {
        const response = await apiClient.get('/products/new-arrivals');
        return response.data;
    }, // Get categories
    getCategories: async () => {
        const response = await apiClient.get('/categories');
        return response.data;
    }, // Admin: Create product
    createProduct: async (productData) => {
        const response = await apiClient.post('/admin/products', productData);
        return response.data;
    }, // Admin: Update product
    updateProduct: async (id, productData) => {
        const response = await apiClient.put(`/admin/products/${id}`, productData);
        return response.data;
    }, // Admin: Delete product
    deleteProduct: async (id) => {
        const response = await apiClient.delete(`/admin/products/${id}`);
        return response.data;
    }, // Admin: Toggle product status
    toggleProductStatus: async (id) => {
        const response = await apiClient.patch(`/admin/products/${id}/toggle-status`);
        return response.data;
    }, // Admin: Update stock
    updateStock: async (id, quantity) => {
        const response = await apiClient.patch(`/admin/products/${id}/stock`, { quantity });
        return response.data;
    }, // Upload product image
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await apiClient.post('/products/upload-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};
export default productService;