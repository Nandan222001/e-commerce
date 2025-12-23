import React from 'react';
import { Container } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import ProductDetail from '../components/products/ProductDetail';
import LoadingScreen from '../components/common/LoadingScreen';
import productService from '../services/productService';
const ProductDetailPage = () => {
    const { id } = useParams();
    const { data: product, isLoading } = useQuery(
        ['product', id], () => productService.getProductById(id)
    );
    if (isLoading) {
        return <LoadingScreen message="Loading product details..." />;
    }
    return (
        <>
            <Helmet>
                <title>{product?.name || 'Product'} - E-Commerce Platform</title>
            </Helmet>
            <Container maxWidth="lg" sx={{ py: 3 }}>
                <ProductDetail />
            </Container>
        </>
    );
};
export default ProductDetailPage;