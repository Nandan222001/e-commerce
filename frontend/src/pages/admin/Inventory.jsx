import React, { useState } from 'react';
import {
    Box, Paper, Typography, Grid, Card, CardContent, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Button, TextField, InputAdornment, Alert, LinearProgress,
} from '@mui/material';
import {
    Inventory as InventoryIcon, Warning as WarningIcon, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon, Search as SearchIcon, Download as DownloadIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import inventoryService from '../../services/inventoryService';
import { formatCurrency } from '../../utils/formatters';
const Inventory = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: stats } = useQuery('inventory-stats', inventoryService.getStats);
    const { data: lowStockItems } = useQuery('low-stock', inventoryService.getLowStock);
    const { data: inventoryMovements } = useQuery('movements', inventoryService.getMovements);
    return (
        <>
            <Helmet>
                <title>Inventory Management - Admin</title>
            </Helmet>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Inventory Management
                </Typography>
                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography color="text.secondary" gutterBottom>
                                            Total Products
                                        </Typography>
                                        <Typography variant="h4">
                                            {stats?.totalProducts || 0}
                                        </Typography>
                                    </Box>
                                    <InventoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                                            Total Stock Value
                                        </Typography>
                                        <Typography variant="h4">
                                            {formatCurrency(stats?.totalValue || 0)}
                                        </Typography>
                                    </Box>
                                    <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
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
                                            Low Stock Items
                                        </Typography>
                                        <Typography variant="h4" color="warning.main">
                                            {stats?.lowStockCount || 0}
                                        </Typography>
                                    </Box>
                                    <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />
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
                                            Out of Stock
                                        </Typography>
                                        <Typography variant="h4" color="error.main">
                                            {stats?.outOfStockCount || 0}
                                        </Typography>
                                    </Box>
                                    <TrendingDownIcon sx={{ fontSize: 40, color: 'error.main' }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
                {/* Low Stock Alert */}
                {lowStockItems?.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Low Stock Alert: {lowStockItems.length} items need restocking
                        </Typography>
                    </Alert>
                )}
                {/* Search and Actions */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                placeholder="Search inventory..." value={searchTerm}
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
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                <Button variant="outlined" startIcon={<DownloadIcon />}>
                                    Export Report
                                </Button>
                                <Button variant="contained">
                                    Adjust Stock
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
                {/* Inventory Table */}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>SKU</TableCell>
                                <TableCell>Product Name</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell align="right">Current Stock</TableCell>
                                <TableCell align="right">Min Stock</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Stock Value</TableCell>
                                <TableCell>Stock Level</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {inventoryMovements?.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.sku}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell align="right">{item.currentStock}</TableCell>
                                    <TableCell align="right">{item.minStock}</TableCell>
                                    <TableCell>
                                        {item.currentStock === 0 ? (
                                            <Chip label="Out of Stock" color="error" size="small" />
                                        ) : item.currentStock <= item.minStock ? (
                                            <Chip label="Low Stock" color="warning" size="small" />
                                        ) : (
                                            <Chip label="In Stock" color="success" size="small" />
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        {formatCurrency(item.stockValue)}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LinearProgress
                                                variant="determinate" value={Math.min((item.currentStock / item.maxStock) * 100, 100)}
                                                sx={{ width: 100 }}
                                                color={
                                                    item.currentStock <= item.minStock ? 'warning' : 'primary'}
                                            />
                                            <Typography variant="caption">
                                                {Math.round((item.currentStock / item.maxStock) * 100)}%
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </>
    );
};
export default Inventory;