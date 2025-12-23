// src/components/checkout/OrderConfirmation.jsx
import React from 'react';
import {
    Box, Paper, Typography, Button,
    Divider, Grid, Alert, List, ListItem, ListItemText, ListItemIcon,
} from '@mui/material';
import {
    CheckCircle as SuccessIcon, Receipt as OrderIcon, LocalShipping as ShippingIcon, Email as EmailIcon, Print as PrintIcon, Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../store/slices/cartSlice';
import { formatCurrency } from '../../utils/formatters';
const OrderConfirmation = ({ order }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    React.useEffect(() => {
        // Clear cart after successful order
        dispatch(clearCart());
    }, [dispatch]);
    const handlePrintOrder = () => {
        window.print();
    };
    const handleViewOrders = () => {
        navigate('/orders');
    };
    const handleContinueShopping = () => {
        navigate('/products');
    };
    return (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {/* Success Message */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <SuccessIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                    Order Placed Successfully!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Thank you for your order. We've sent a confirmation email to your registered email
                    address. </Typography>
            </Box>
            {/* Order Details */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Order Details
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                            Order Number
                        </Typography>
                        <Typography variant="h6" color="primary">
                            {order.orderNumber}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                            Order Date
                        </Typography>
                        <Typography variant="body1">
                            {new Date().toLocaleDateString()}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                            Payment Method
                        </Typography>
                        <Typography variant="body1">
                            {order.paymentMethod?.replace(/_/g, ' ')}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                            Total Amount
                        </Typography>
                        <Typography variant="h6" color="primary">
                            {formatCurrency(order.total)}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
            {/* What's Next */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    What Happens Next?
                </Typography>
                <List>
                    <ListItem>
                        <ListItemIcon>
                            <EmailIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Order Confirmation Email" secondary="You'll receive an email with your order details and tracking information" />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <OrderIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Order Processing" secondary="We'll start processing your order immediately" />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <ShippingIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Shipping Updates" secondary="You'll receive updates when your order is shipped and out for delivery" />
                    </ListItem>
                </List>
            </Paper>
            {/* Estimated Delivery */}
            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Estimated Delivery
                </Typography>
                <Typography variant="body2">
                    Your order will be delivered within 3-5 business days
                </Typography>
            </Alert>
            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                    variant="contained" onClick={handleViewOrders}
                    startIcon={<OrderIcon />}
                >
                    View My Orders
                </Button>
                <Button
                    variant="outlined" onClick={handlePrintOrder}
                    startIcon={<PrintIcon />}
                >
                    Print Order
                </Button>
                <Button
                    variant="outlined" onClick={handleContinueShopping}
                    startIcon={<HomeIcon />}
                >
                    Continue Shopping
                </Button>
            </Box>
            {/* Additional Info */}
            <Box sx={{ mt: 4, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" align="center">
                    Need help? Contact our customer support at support@ecommerce.com or call 1-800- SHOP
                </Typography>
            </Box>
        </Box>
    );
};
export default OrderConfirmation;