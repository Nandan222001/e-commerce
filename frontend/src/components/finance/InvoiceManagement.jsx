import React, { useState } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, IconButton, Button, TextField, InputAdornment,
} from '@mui/material';
import {
    Search as SearchIcon, Download as DownloadIcon, Send as SendIcon, Visibility as ViewIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import financeService from '../../services/financeService';
import { formatCurrency } from '../../utils/formatters';
const InvoiceManagement = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const { data: invoices, isLoading } = useQuery(
        ['invoices', page, rowsPerPage, searchTerm], () => financeService.getInvoices({
            page, size: rowsPerPage, search: searchTerm,
        })
    );
    const getStatusColor = (status) => {
        const colors = {
            DRAFT: 'default', SENT: 'info', PAID: 'success', PARTIALLY_PAID: 'warning', OVERDUE: 'error', CANCELLED: 'error',
        };
        return colors[status] || 'default';
    };
    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                    fullWidth
                    placeholder="Search invoices..." value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <Button variant="contained">
                    Create Invoice
                </Button>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Invoice #</TableCell>
                            <TableCell>Customer</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {invoices?.content?.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell>{invoice.invoiceNumber}</TableCell>
                                <TableCell>{invoice.customerName}</TableCell>
                                <TableCell>{invoice.invoiceDate}</TableCell>
                                <TableCell>{invoice.dueDate}</TableCell>
                                <TableCell align="right">{formatCurrency(invoice.totalAmount)}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={invoice.status}
                                        color={getStatusColor(invoice.status)}
                                        size="small" />
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton size="small">
                                        <ViewIcon />
                                    </IconButton>
                                    <IconButton size="small">
                                        <SendIcon />
                                    </IconButton>
                                    <IconButton size="small">
                                        <DownloadIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div" count={invoices?.totalElements || 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </TableContainer>
        </Box>
    );
};
export default InvoiceManagement;