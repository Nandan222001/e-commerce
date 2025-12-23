import apiClient from './apiClient';
const addressService = {
    // Get user addresses
    getUserAddresses: async () => {
        const response = await apiClient.get('/users/addresses');
        return response.data;
    }, // Add address
    addAddress: async (addressData) => {
        const response = await apiClient.post('/users/addresses', addressData);
        return response.data;
    }, // Update address
    updateAddress: async (id, addressData) => {
        const response = await apiClient.put(`/users/addresses/${id}`, addressData);
        return response.data;
    }, // Delete address
    deleteAddress: async (id) => {
        const response = await apiClient.delete(`/users/addresses/${id}`);
        return response.data;
    }, // Set default address
    setDefaultAddress: async (id) => {
        const response = await apiClient.patch(`/users/addresses/${id}/set-default`);
        return response.data;
    },
};
export default addressService;