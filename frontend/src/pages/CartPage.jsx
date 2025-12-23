import React from 'react';
import { Container } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import CartPageComponent from '../components/cart/CartPage';
const CartPage = () => {
    return (
        <>
            <Helmet>
                <title>Shopping Cart - E-Commerce Platform</title>
            </Helmet>
            <Container maxWidth="lg" sx={{ py: 3 }}>
                <CartPageComponent />
            </Container>
        </>
    );
};
export default CartPage;