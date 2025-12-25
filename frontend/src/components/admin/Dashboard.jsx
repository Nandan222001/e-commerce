// src/components/admin/Dashboard.jsx
import React from 'react';
import {
  Grid, Typography, Card, Box, Stack, useTheme, alpha
} from '@mui/material';
import {
  TrendingUp, ShoppingBag, People, AttachMoney, 
  Inventory2
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import adminService from '../../services/adminService';
import { formatCurrency } from '../../utils/formatters';

const AppWidgetSummary = ({ title, total, icon, color = 'primary' }) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        py: 5,
        boxShadow: 0,
        textAlign: 'center',
        color: theme.palette[color].darker,
        bgcolor: alpha(theme.palette[color].main, 0.12),
        borderRadius: 4,
      }}
    >
      <Box
        sx={{
          margin: 'auto',
          display: 'flex',
          borderRadius: '50%',
          alignItems: 'center',
          width: 64,
          height: 64,
          justifyContent: 'center',
          marginBottom: 3,
          color: theme.palette[color].dark,
          backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette[color].dark, 0)} 0%, ${alpha(
            theme.palette[color].dark,
            0.24
          )} 100%)`,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h3" fontWeight="bold">{total}</Typography>
      <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>
        {title}
      </Typography>
    </Card>
  );
};

const AdminDashboard = () => {
  const { data: stats } = useQuery('dashboard-stats', adminService.getDashboardStats);
  const { data: salesData } = useQuery('sales-data', () => adminService.getSalesData('monthly'));

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 5 }} fontWeight="bold">
        Hi, Welcome back
      </Typography>

      <Grid container spacing={3}>
        {/* Widgets */}
        <Grid item xs={12} sm={6} md={3}>
          <AppWidgetSummary 
            title="Total Revenue" 
            total={formatCurrency(stats?.totalRevenue || 0)} 
            icon={<AttachMoney />}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <AppWidgetSummary 
            title="Total Orders" 
            total={stats?.totalOrders || 0} 
            icon={<ShoppingBag />} 
            color="info"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <AppWidgetSummary 
            title="Total Products" 
            total={stats?.totalProducts || 0} 
            icon={<Inventory2 />} 
            color="warning"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <AppWidgetSummary 
            title="New Customers" 
            total={stats?.totalCustomers || 0} 
            icon={<People />} 
            color="error"
          />
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }} fontWeight="bold">
              Sales Overview
            </Typography>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={salesData?.data || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: 8 }}
                />
                <Bar dataKey="amount" fill="#00AB55" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Recent Activity / Smaller Panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%', borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }} fontWeight="bold">
              Order Status
            </Typography>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Pending</Typography>
                <Typography variant="subtitle1">{stats?.pendingOrders || 0}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Processing</Typography>
                <Typography variant="subtitle1">{stats?.processingOrders || 0}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Completed</Typography>
                <Typography variant="subtitle1" color="success.main">{stats?.completedOrders || 0}</Typography>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;