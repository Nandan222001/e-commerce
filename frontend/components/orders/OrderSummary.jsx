import React, { useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { formatCurrency } from '../../utils/formatters';

const OrderSummary = ({ order, onDownloadInvoice, onPrint }) => {
  const user = useSelector(selectCurrentUser);
  
  const statusColor = useMemo(() => {
    const colors = {
      PENDING: 'warning',
      CONFIRMED: 'info',
      PROCESSING: 'info',
      PACKED: 'info',
      SHIPPED: 'primary',
      DELIVERED: 'success',
      CANCELLED: 'error',
      REFUNDED: 'error',
    };
    return colors[order.status] || 'default';
  }, [order.status]);

  const paymentStatusColor = useMemo(() => {
    const colors = {
      PENDING: 'warning',
      COMPLETED: 'success',
      FAILED: 'error',
      REFUNDED: 'error',
    };
    return colors[order.paymentStatus] || 'default';
  }, [order.paymentStatus]);

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Order #{order.orderNumber}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={onPrint}
          >
            Print
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={onDownloadInvoice}
          >
            Download Invoice
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="caption" color="text.secondary">
            Order Date
          </Typography>
          <Typography variant="body1">
            {format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm')}
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="caption" color="text.secondary">
            Order Status
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <Chip label={order.status} color={statusColor} size="small" />
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="caption" color="text.secondary">
            Payment Status
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <Chip label={order.paymentStatus} color={paymentStatusColor} size="small" />
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="caption" color="text.secondary">
            Payment Method
          </Typography>
          <Typography variant="body1">
            {order.paymentMethod}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Customer Information */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Customer Information
          </Typography>
          <Typography variant="body2">
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="body2">{user.email}</Typography>
          <Typography variant="body2">{user.phoneNumber}</Typography>
          
          {user.customerType === 'BUSINESS' && (
            <>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Company:</strong> {user.companyName}
              </Typography>
              <Typography variant="body2">
                <strong>GST Number:</strong> {user.gstNumber}
              </Typography>
            </>
          )}
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Shipping Address
          </Typography>
          {order.shippingAddress && (
            <>
              <Typography variant="body2">
                {order.shippingAddress.addressLine1}
              </Typography>
              {order.shippingAddress.addressLine2 && (
                <Typography variant="body2">
                  {order.shippingAddress.addressLine2}
                </Typography>
              )}
              <Typography variant="body2">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </Typography>
              <Typography variant="body2">
                {order.shippingAddress.country}
              </Typography>
            </>
          )}
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Order Items */}
      <Typography variant="h6" gutterBottom>
        Order Items
      </Typography>
      
      <TableContainer sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="center">Quantity</TableCell>
              <TableCell align="right">Unit Price</TableCell>
              <TableCell align="right">Tax</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.orderItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Typography variant="body2">{item.productName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    SKU: {item.productSku}
                  </Typography>
                </TableCell>
                <TableCell align="center">{item.quantity}</TableCell>
                <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                <TableCell align="right">{formatCurrency(item.taxAmount)}</TableCell>
                <TableCell align="right">{formatCurrency(item.totalAmount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Price Summary */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Box sx={{ width: { xs: '100%', sm: '50%', md: '40%' } }}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="body2">Subtotal:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" align="right">
                {formatCurrency(order.subtotal)}
              </Typography>
            </Grid>
            
            {order.cgstAmount > 0 && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2">CGST (9%):</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" align="right">
                    {formatCurrency(order.cgstAmount)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2">SGST (9%):</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" align="right">
                    {formatCurrency(order.sgstAmount)}
                  </Typography>
                </Grid>
              </>
            )}
            
            {order.igstAmount > 0 && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2">IGST (18%):</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" align="right">
                    {formatCurrency(order.igstAmount)}
                  </Typography>
                </Grid>
              </>
            )}
            
            {order.shippingCharge > 0 && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2">Shipping:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" align="right">
                    {formatCurrency(order.shippingCharge)}
                  </Typography>
                </Grid>
              </>
            )}
            
            {order.discount > 0 && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2">Discount:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" align="right" color="success.main">
                    -{formatCurrency(order.discount)}
                  </Typography>
                </Grid>
              </>
            )}
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="h6">Total Amount:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6" align="right" color="primary">
                {formatCurrency(order.totalAmount)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Order Notes */}
      {order.customerNotes && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>
            Customer Notes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {order.customerNotes}
          </Typography>
        </>
      )}

      {/* Tracking Information */}
      {order.trackingNumber && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>
            Tracking Information
          </Typography>
          <Typography variant="body2">
            Tracking Number: <strong>{order.trackingNumber}</strong>
          </Typography>
          {order.estimatedDeliveryDate && (
            <Typography variant="body2">
              Estimated Delivery: {format(new Date(order.estimatedDeliveryDate), 'dd MMM yyyy')}
            </Typography>
          )}
        </>
      )}
    </Paper>
  );
};

export default OrderSummary;