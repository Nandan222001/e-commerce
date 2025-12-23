import React from 'react';
import { Helmet } from 'react-helmet-async';
import ProductManagement from '../../components/admin/ProductManagement';
const Products = () => {
    return (
        <>
            <Helmet>
                <title>Product Management - Admin</title>
            </Helmet>
            <ProductManagement />
        </>
    );
};
export default Products;