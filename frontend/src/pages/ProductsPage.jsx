import React from 'react';
import { Box, Container, Typography, Breadcrumbs, Link } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductList from '../components/products/ProductList';
const ProductsPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('search');
    const category = searchParams.get('category');
    return (
        <>
            <Helmet>
                <title>Products - E-Commerce Platform</title>
            </Helmet>
            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Breadcrumbs sx={{ mb: 2 }}>
                    <Link
                        component="button" variant="body2" onClick={() => navigate('/')}
                        underline="hover" >
                        Home
                    </Link>
                    <Typography variant="body2" color="text.primary">
                        Products
                    </Typography>
                    {category && (
                        <Typography variant="body2" color="text.primary">
                            {category}
                        </Typography>
                    )}
                </Breadcrumbs>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h3" component="h1" gutterBottom>
                        {searchTerm ? `Search Results for "${searchTerm}"` : 'All Products'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Browse our complete catalog of products
                    </Typography>
                </Box>
                <ProductList />
            </Container>
        </>
    );
};
export default ProductsPage;