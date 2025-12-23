import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ShoppingCart as CartIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
const EmptyCart = () => {
    const navigate = useNavigate();
    return (
        <Box
            sx={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', p: 3,
            }}
        >
            <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
                <CartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                    Your cart is empty
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Add items to your cart to continue shopping
                </Typography>
                <Button
                    variant="contained" size="large" onClick={() => navigate('/products')}
                >
                    Start Shopping
                </Button>
            </Paper>
        </Box>
    );
};
export default EmptyCart;