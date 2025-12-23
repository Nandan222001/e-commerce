import React from 'react';
import { Container } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import OrderList from '../components/orders/OrderList';
const OrdersPage = () => {
    return (
        <>
            <Helmet>
                <title>My Orders - E-Commerce Platform</title>
            </Helmet>
            <Container maxWidth="lg" sx={{ py: 3 }}>
                <OrderList />
            </Container>
        </>
    );
};
export default OrdersPage;