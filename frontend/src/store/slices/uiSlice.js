// src/store/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';
const uiSlice = createSlice({
    name: 'ui', initialState: {
        sidebarOpen: false, theme: 'light', notifications: [], loading: false,
    }, reducers: {
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        }, setSidebarOpen: (state, action) => {
            state.sidebarOpen = action.payload;
        }, setTheme: (state, action) => {
            state.theme = action.payload;
        }, addNotification: (state, action) => {
            state.notifications.push({
                id: Date.now(), ...action.payload,
            });
        }, removeNotification: (state, action) => {
            state.notifications = state.notifications.filter(
                (n) => n.id !== action.payload
            );
        }, clearNotifications: (state) => {
            state.notifications = [];
        }, setLoading: (state, action) => {
            state.loading = action.payload;
        },
    },
});
export const {
    toggleSidebar, setSidebarOpen, setTheme, addNotification, removeNotification, clearNotifications, setLoading, } = uiSlice.actions;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectTheme = (state) => state.ui.theme;
export const selectNotifications = (state) => state.ui.notifications;
export const selectUILoading = (state) => state.ui.loading;
export default uiSlice.reducer;