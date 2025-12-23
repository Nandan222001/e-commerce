import React from 'react';
import { Helmet } from 'react-helmet-async';
import AdminDashboard from '../../components/admin/Dashboard';
const Dashboard = () => {
    return (
        <>
            <Helmet>
                <title>Admin Dashboard - E-Commerce Platform</title>
            </Helmet>
            <AdminDashboard />
        </>
    );
};
export default Dashboard;