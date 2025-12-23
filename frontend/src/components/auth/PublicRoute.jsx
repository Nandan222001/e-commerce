import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
const PublicRoute = ({ redirectTo = '/' }) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    // If user is authenticated, redirect to home or specified path
    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }
    // If not authenticated, render the outlet (child routes)
    return <Outlet />;
};
export default PublicRoute;