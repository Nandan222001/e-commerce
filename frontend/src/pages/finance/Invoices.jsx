import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Typography } from '@mui/material';
import InvoiceManagement from '../../components/finance/InvoiceManagement';
const Invoices = () => {
    return (
        <>
            <Helmet>
                <title>Invoice Management - Finance</title>
            </Helmet>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Invoice Management
                </Typography>
                <InvoiceManagement />
            </Box>
        </>
    );
};
export default Invoices;