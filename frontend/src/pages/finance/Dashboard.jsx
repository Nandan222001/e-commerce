import React from 'react';
import {
    Box, Grid, Paper, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
} from '@mui/material';
import {
    AttachMoney as RevenueIcon, Receipt as InvoiceIcon, TrendingUp as GrowthIcon, AccountBalance as TaxIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import {
    LineChart, Line, BarChart,
    Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useQuery } from 'react-query';
import financeService from '../../services/financeService';
import { formatCurrency } from '../../utils/formatters';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const FinanceDashboard = () => {
    const { data: stats } = useQuery('finance-stats', financeService.getStats);
    const { data: revenueData } = useQuery('revenue-data', financeService.getRevenueData);
    const { data: pendingInvoices } = useQuery('pending-invoices', financeService.getPendingInvoices);
    return (
        <>
            <Helmet>
                <title>Finance Dashboard - E-Commerce Platform</title>
            </Helmet>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Finance Dashboard
                </Typography>
                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography color="text.secondary" gutterBottom>
                                            Total Revenue
                                        </Typography>
                                        <Typography variant="h4">
                                            {formatCurrency(stats?.totalRevenue || 0)}
                                        </Typography>
                                        <Typography variant="caption" color="success.main">
                                            +12% from last month
                                        </Typography>
                                    </Box>
                                    <RevenueIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography color="text.secondary" gutterBottom>
                                            Pending Invoices
                                        </Typography>
                                        <Typography variant="h4">
                                            {stats?.pendingInvoices || 0}
                                        </Typography>
                                        <Typography variant="caption">
                                            {formatCurrency(stats?.pendingAmount || 0)}
                                        </Typography>
                                    </Box>
                                    <InvoiceIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography color="text.secondary" gutterBottom>
                                            Total GST Collected
                                        </Typography>
                                        <Typography variant="h4">
                                            {formatCurrency(stats?.totalGST || 0)}
                                        </Typography>
                                    </Box>
                                    <TaxIcon sx={{ fontSize: 40, color: 'info.main' }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography color="text.secondary" gutterBottom>
                                            Growth Rate
                                        </Typography>
                                        <Typography variant="h4">
                                            {stats?.growthRate || 0}%
                                        </Typography>
                                        <Typography variant="caption" color="success.main">
                                            Year over Year
                                        </Typography>
                                    </Box>
                                    <GrowthIcon sx={{ fontSize: 40, color: 'success.main' }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
                {/* Charts */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Revenue Trend
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                                    <Line type="monotone" dataKey="profit" stroke="#82ca9d" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Payment Methods
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={stats?.paymentMethods}
                                        cx="50%" cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8" dataKey="value" >
                                        {stats?.paymentMethods?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                </Grid>
                {/* Pending Invoices Table */}
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Recent Pending Invoices
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Invoice #</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Due Date</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pendingInvoices?.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell>{invoice.invoiceNumber}</TableCell>
                                        <TableCell>{invoice.customerName}</TableCell>
                                        <TableCell>{invoice.date}</TableCell>
                                        <TableCell>{invoice.dueDate}</TableCell>
                                        <TableCell align="right">{formatCurrency(invoice.amount)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={invoice.status}
                                                color={invoice.status === 'OVERDUE' ? 'error' : 'warning'}
                                                size="small" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>
        </>
    );
};
export default FinanceDashboard;