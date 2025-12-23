import React from 'react';
import {
    Paper, Typography, Box, Divider, Button, TextField,
} from '@mui/material';
import { formatCurrency } from '../../utils/formatters';
const CartSummary = ({ subtotal, gst, total, onCheckout }) => {
    return (
        <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
                Order Summary
            </Typography>
            <Box sx={{ mb: 2 }}>
                <TextField
                    fullWidth
                    placeholder="Coupon Code" size="small" sx={{ mb: 1 }}
                />
                <Button variant="outlined" fullWidth size="small">
                    Apply Coupon
                </Button>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>{formatCurrency(subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>GST:</Typography>
                    <Typography>{formatCurrency(gst)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Shipping:</Typography>
                    <Typography color="success.main">Free</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" color="primary">
                        {formatCurrency(total)}
                    </Typography>
                </Box>
            </Box>
            <Button
                fullWidth
                variant="contained" size="large" onClick={onCheckout}
                sx={{ mt: 3 }}
            >
                Proceed to Checkout
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{
                display: 'block', mt: 2, textAlign:
                    'center'
            }}>
                Secure checkout powered by SSL encryption
            </Typography>
        </Paper>
    );
};
export default CartSummary;