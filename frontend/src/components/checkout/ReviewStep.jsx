// src/components/checkout/ReviewStep.jsx
import React, { useState } from 'react';
import {
    Box, Typography, Paper, Grid, Divider, Button, TextField, Checkbox, FormControlLabel, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, CircularProgress,
} from '@mui/material';
import {
    ArrowBack as BackIcon, ShoppingCart as OrderIcon, LocationOn as AddressIcon, Payment as PaymentIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectCustomerType } from '../../store/slices/authSlice';
import { formatCurrency } from '../../utils/formatters';
const ReviewStep = ({ orderData, cartItems, onPlaceOrder, onBack }) => {
    const user = useSelector(selectCurrentUser);
    const customerType = useSelector(selectCustomerType);
    const [customerNotes, setCustomerNotes] = useState('');
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => {
            const price = customerType === 'BUSINESS' && item.product.businessPrice
                ? item.product.businessPrice
                : item.product.basePrice;
            return total + (price * item.quantity);
        }, 0);
    };
    const calculateGST = () => {
        let totalGST = 0;
        cartItems.forEach((item) => {
            if (item.product.gstApplicable) {
                const price = customerType === 'BUSINESS' && item.product.businessPrice
                    ? item.product.businessPrice
                    : item.product.basePrice;
                const itemTotal = price * item.quantity;
                totalGST += (itemTotal * item.product.gstRate) / 100;
            }
        });
        return totalGST;
    };
    const subtotal = calculateSubtotal();
    const gstAmount = calculateGST();
    const shippingCharge = subtotal > 500 ? 0 : 50;
    const codCharge = orderData.paymentMethod === 'COD' ? 50 : 0;
    const total = subtotal + gstAmount + shippingCharge + codCharge;
    const handlePlaceOrder = async () => {
        if (!agreeToTerms) {
            alert('Please agree to the terms and conditions');
            return;
        }
        setLoading(true);
        try {
            await onPlaceOrder({
                customerNotes, subtotal, gstAmount, shippingCharge, codCharge, total,
            });
        } catch (error) {
            console.error('Order placement failed:', error);
            setLoading(false);
        }
    };
    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Review Your Order
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
                Please review your order details before confirming the purchase. </Alert>
            {/* Shipping Address */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AddressIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Shipping Address</Typography>
                </Box>
                <Typography variant="body2">
                    {orderData.shippingAddress.addressLine1}
                </Typography>
                {orderData.shippingAddress.addressLine2 && (
                    <Typography variant="body2">
                        {orderData.shippingAddress.addressLine2}
                    </Typography>
                )}
                <Typography variant="body2">
                    {orderData.shippingAddress.city}, {orderData.shippingAddress.state} - {orderData.shippingAddress.postalCode}
                </Typography>
                <Typography variant="body2">
                    {orderData.shippingAddress.country}
                </Typography>
            </Paper>
            {/* Payment Method */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PaymentIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Payment Method</Typography>
                </Box>
                <Typography variant="body2">
                    {orderData.paymentMethod.replace(/_/g, ' ')}
                </Typography>
                {orderData.paymentMethod === 'CREDIT_CARD' || orderData.paymentMethod ===
                    'DEBIT_CARD' ? (
                    <Typography variant="body2" color="text.secondary">
                        Card ending in ****{orderData.paymentDetails.cardNumber?.slice(-4)}
                    </Typography>
                ) : orderData.paymentMethod === 'UPI' ? (
                    <Typography variant="body2" color="text.secondary">
                        UPI ID: {orderData.paymentDetails.upiId}
                    </Typography>
                ) : null}
            </Paper>
            {/* Order Items */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <OrderIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Order Items</Typography>
                </Box>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Product</TableCell>
                                <TableCell align="center">Qty</TableCell>
                                <TableCell align="right">Price</TableCell>
                                <TableCell align="right">Total</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cartItems.map((item) => {
                                const price = customerType === 'BUSINESS' && item.product.businessPrice
                                    ? item.product.businessPrice
                                    : item.product.basePrice;
                                return (
                                    <TableRow key={item.product.id}>
                                        <TableCell>
                                            <Typography variant="body2">{item.product.name}</Typography>
                                            {item.product.partNumber && (
                                                <Typography variant="caption" color="text.secondary">
                                                    Part #: {item.product.partNumber}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">{item.quantity}</TableCell>
                                        <TableCell align="right">{formatCurrency(price)}</TableCell>
                                        <TableCell align="right">{formatCurrency(price * item.quantity)}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            {/* Price Summary */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Order Summary
                </Typography>
                <Grid container spacing={1}>
                    <Grid item xs={6}>
                        <Typography variant="body2">Subtotal:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" align="right">
                            {formatCurrency(subtotal)}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2">GST:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" align="right">
                            {formatCurrency(gstAmount)}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2">Shipping:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" align="right">
                            {shippingCharge === 0 ? 'Free' : formatCurrency(shippingCharge)}
                        </Typography>
                    </Grid>
                    {codCharge > 0 && (
                        <>
                            <Grid item xs={6}>
                                <Typography variant="body2">COD Charges:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" align="right">
                                    {formatCurrency(codCharge)}
                                </Typography>
                            </Grid>
                        </>
                    )}
                    <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="h6">Total:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="h6" align="right" color="primary">
                            {formatCurrency(total)}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
            {/* Customer Notes */}
            <TextField
                fullWidth
                multiline
                rows={3}
                label="Order Notes (Optional)" placeholder="Add any special instructions for your order" value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                sx={{ mb: 2 }}
            />
            {/* Terms and Conditions */}
            <FormControlLabel
                control={
                    <Checkbox
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                    />
                }
                label="I agree to the Terms and Conditions and Privacy Policy" sx={{ mb: 2 }}
            />
            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    startIcon={<BackIcon />}
                    onClick={onBack}
                    disabled={loading}
                >
                    Back
                </Button>
                <Button
                    variant="contained" onClick={handlePlaceOrder}
                    disabled={!agreeToTerms || loading}
                    size="large" >
                    {loading ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Processing... </>
                    ) : (
                        `Place Order (${formatCurrency(total)})`)}
                </Button>
            </Box>
        </Box>
    );
};
export default ReviewStep;