import React, { useState } from 'react';
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, IconButton, Button, TextField, InputAdornment, Select,
    MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Tabs, Tab,
} from '@mui/material';
import {
    Visibility as ViewIcon, Edit as EditIcon, Download as DownloadIcon, Search as SearchIcon, FilterList as FilterIcon, LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import orderService from '../../services/orderService';
import { formatCurrency } from '../../utils/formatters';
const Orders = () => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const { data: orders, isLoading } = useQuery(
        ['admin-orders', page, rowsPerPage, searchTerm, filterStatus, tabValue], () => orderService.getAllOrders({
            page, size: rowsPerPage, search: searchTerm, status: filterStatus, type: tabValue === 0 ? 'all' : tabValue === 1 ? 'pending' : 'completed',
        }), { keepPreviousData: true }
    );
    const updateStatusMutation = useMutation(
        ({ id, status }) => orderService.updateOrderStatus(id, status), {
        onSuccess: () => {
            queryClient.invalidateQueries('admin-orders');
            setOpenDialog(false);
        },
    }
    );
    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setOpenDialog(true);
    };
    const handleUpdateStatus = (newStatus) => {
        if (selectedOrder) {
            updateStatusMutation.mutate({
                id: selectedOrder.id, status: newStatus,
            });
        }
    };
    const getStatusColor = (status) => {
        const statusColors = {
            PENDING: 'warning', CONFIRMED: 'info',
            PROCESSING: 'info', SHIPPED: 'primary', DELIVERED: 'success', CANCELLED: 'error',
        };
        return statusColors[status] || 'default';
    };
    return (
        <>
            <Helmet>
                <title>Order Management - Admin</title>
            </Helmet>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Order Management
                </Typography>
                <Paper sx={{ mb: 2 }}>
                    <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                        <Tab label="All Orders" />
                        <Tab label="Pending Orders" />
                        <Tab label="Completed Orders" />
                    </Tabs>
                </Paper>
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                placeholder="Search orders..." value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Filter by Status</InputLabel>
                                <Select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    label="Filter by Status" >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="PENDING">Pending</MenuItem>
                                    <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                                    <MenuItem value="PROCESSING">Processing</MenuItem>
                                    <MenuItem value="SHIPPED">Shipped</MenuItem>
                                    <MenuItem value="DELIVERED">Delivered</MenuItem>
                                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button variant="outlined" startIcon={<FilterIcon />}>
                                    More Filters
                                </Button>
                                <Button variant="contained" startIcon={<DownloadIcon />}>
                                    Export Orders
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Order #</TableCell>
                                <TableCell>Customer</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Items</TableCell>
                                <TableCell>Total</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Payment</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders?.content?.map((order) => (
                                <TableRow key={order.id} hover>
                                    <TableCell>{order.orderNumber}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{order.user.firstName}
                                            {order.user.lastName}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {order.user.customerType}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{format(new Date(order.createdAt), 'dd MMM yyyy')}</TableCell>
                                    <TableCell>{order.orderItems.length}</TableCell>
                                    <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={order.status}
                                            color={getStatusColor(order.status)}
                                            size="small" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={order.paymentStatus}
                                            size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" onClick={() => handleViewOrder(order)}>
                                            <ViewIcon />
                                        </IconButton>
                                        <IconButton size="small">
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div" count={orders?.totalElements || 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                    />
                </TableContainer>
                {/* Order Details Dialog */}
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                    <DialogTitle>
                        Order Details - {selectedOrder?.orderNumber}
                    </DialogTitle>
                    <DialogContent>
                        {selectedOrder && (
                            <Box>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2">Customer</Typography>
                                        <Typography variant="body1">
                                            {selectedOrder.user.firstName} {selectedOrder.user.lastName}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2">Status</Typography>
                                        <Select
                                            value={selectedOrder.status}
                                            onChange={(e) => handleUpdateStatus(e.target.value)}
                                            size="small" >
                                            <MenuItem value="PENDING">Pending</MenuItem>
                                            <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                                            <MenuItem value="PROCESSING">Processing</MenuItem>
                                            <MenuItem value="SHIPPED">Shipped</MenuItem>
                                            <MenuItem value="DELIVERED">Delivered</MenuItem>
                                            <MenuItem value="CANCELLED">Cancelled</MenuItem>
                                        </Select>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>Close</Button>
                        <Button variant="contained">Save Changes</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    );
};
export default Orders;