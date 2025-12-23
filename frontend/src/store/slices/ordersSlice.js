// src/store/slices/ordersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../../services/orderService';
export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async (params) => {
        const response = await orderService.getOrders(params);
        return response;
    }
);
export const createOrder = createAsyncThunk(
    'orders/createOrder', async (orderData) => {
        const response = await orderService.createOrder(orderData);
        return response;
    }
);
const ordersSlice = createSlice({
    name: 'orders', initialState: {
        items: [], currentOrder: null, loading: false, error: null,
    }, reducers: {
        setCurrentOrder: (state, action) => {
            state.currentOrder = action.payload;
        }, clearCurrentOrder: (state) => {
            state.currentOrder = null;
        },
    }, extraReducers: (builder) => {
        builder
            // Fetch orders
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.content;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Create order
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});
export const { setCurrentOrder, clearCurrentOrder } = ordersSlice.actions;
export const selectOrders = (state) => state.orders.items;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrdersLoading = (state) => state.orders.loading;
export default ordersSlice.reducer;