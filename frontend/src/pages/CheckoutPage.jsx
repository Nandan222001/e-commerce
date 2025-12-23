import React from 'react';
import { Container } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import CheckoutPageComponent from '../components/checkout/CheckoutPage';
const CheckoutPage = () => {
    return (
        <>
            <Helmet>
                <title>Checkout - E-Commerce Platform</title>
            </Helmet>
            <Container maxWidth="lg" sx={{ py: 3 }}>
                <CheckoutPageComponent />
            </Container>
        </>
    );
};
export default CheckoutPage;