import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';
import { formatCurrency } from '../../utils/formatters';

const OrderList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data: orders, isLoading } = useQuery(
    ['orders', page, rowsPerPage, searchTerm, filterStatus],
    () => orderService.getOrders({
      page,
      size: rowsPerPage,
      search: searchTerm,
      status: filterStatus,
    }),
    { keepPreviousData: true }
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      await orderService.downloadInvoice(orderId);
    } catch (error) {
      console.error('Failed to download invoice:', error);
    }
  };

  const handleMenuOpen = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      PENDING: 'warning',
      CONFIRMED: 'info',
      PROCESSING: 'info',
      SHIPPED: 'primary',
      DELIVERED: 'success',
      CANCELLED: 'error',
      REFUNDED: 'error',
    };
    return statusColors[status] || 'default';
  };

  const getPaymentStatusColor = (status) => {
    const statusColors = {
      PENDING: 'warning',
      COMPLETED: 'success',
      FAILED: 'error',
    };
    return statusColors[status] || 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Orders
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
          >
            Filter
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Number</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Order Status</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders?.content?.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {order.orderNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  {format(new Date(order.createdAt), 'dd MMM yyyy')}
                </TableCell>
                <TableCell>{order.orderItems.length}</TableCell>
                <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={order.paymentStatus}
                    color={getPaymentStatusColor(order.paymentStatus)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Order">
                    <IconButton
                      size="small"
                      onClick={() => handleViewOrder(order.id)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download Invoice">
                    <IconButton
                      size="small"
                      onClick={() => handleDownloadInvoice(order.id)}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, order)}
                  >
                    <MoreIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={orders?.totalElements || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/orders/${selectedOrder?.id}/track`);
          handleMenuClose();
        }}>
          Track Order
        </MenuItem>
        {selectedOrder?.status === 'DELIVERED' && (
          <MenuItem onClick={() => {
            navigate(`/orders/${selectedOrder?.id}/return`);
            handleMenuClose();
          }}>
            Return/Refund
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          navigate(`/orders/${selectedOrder?.id}/help`);
          handleMenuClose();
        }}>
          Get Help
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default OrderList;