// src/store/slices/productsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../../services/productService';
export const fetchProducts = createAsyncThunk(
    'products/fetchProducts', async (params) => {
        const response = await productService.getProducts(params);
        return response;
    }
);
const productsSlice = createSlice({
    name: 'products', initialState: {
        items: [], totalItems: 0, currentPage: 1, totalPages: 1, loading: false, error: null, filters: {
            category: '', minPrice: '', maxPrice: '', inStock: false, search: '',
        },
    }, reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        }, clearFilters: (state) => {
            state.filters = {
                category: '', minPrice: '', maxPrice: '', inStock: false, search: '',
            };
        }, setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
    }, extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.content;
                state.totalItems = action.payload.totalElements;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});
export const { setFilters, clearFilters, setCurrentPage } = productsSlice.actions;
export const selectProducts = (state) => state.products.items;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsFilters = (state) => state.products.filters;
export default productsSlice.reducer;