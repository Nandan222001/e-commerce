import React from 'react';
import {
    Paper, Grid, Box, Typography, Button, Chip, IconButton,
} from '@mui/material';
import {
    ShoppingCart as CartIcon, Visibility as ViewIcon, FavoriteBorder as WishlistIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { selectCustomerType } from '../../store/slices/authSlice';
import { formatCurrency } from '../../utils/formatters';
const ProductListItem = ({ product }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const customerType = useSelector(selectCustomerType);
    const handleAddToCart = () => {
        dispatch(addToCart({ product, quantity: 1 }));
    };
    const handleViewDetails = () => {
        navigate(`/products/${product.id}`);
    };
    const getPrice = () => {
        if (customerType === 'BUSINESS' && product.businessPrice) {
            return product.businessPrice;
        }
        return product.basePrice;
    };
    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                    <Box
                        component="img" src={product.imageUrl || '/images/placeholder.png'}
                        alt={product.name}
                        sx={{
                            width: '100%', height: 120, objectFit: 'cover', borderRadius: 1, cursor: 'pointer',
                        }}
                        onClick={handleViewDetails}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom sx={{ cursor: 'pointer' }}
                        onClick={handleViewDetails}>
                        {product.name}
                    </Typography>
                    {product.partNumber && (
                        <Typography variant="caption" color="text.secondary">
                            Part #: {product.partNumber}
                        </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {product.description?.substring(0, 150)}... </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        {product.inStock ? (
                            <Chip label="In Stock" color="success" size="small" />
                        ) : (
                            <Chip label="Out of Stock" color="error" size="small" />
                        )}
                        {customerType === 'BUSINESS' && product.businessPrice && (
                            <Chip label="Business Price" color="primary" size="small" />
                        )}
                    </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h5" color="primary" gutterBottom>
                            {formatCurrency(getPrice())}
                        </Typography>
                        {product.gstApplicable && (
                            <Typography variant="caption" color="text.secondary" display="block">
                                + GST {product.gstRate}%
                            </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
                            <IconButton size="small" onClick={() => { }}>
                                <WishlistIcon />
                            </IconButton>
                            <Button
                                variant="outlined" size="small" startIcon={<ViewIcon />}
                                onClick={handleViewDetails}
                            >
                                View
                            </Button>
                            <Button
                                variant="contained" size="small" startIcon={<CartIcon />}
                                onClick={handleAddToCart}
                                disabled={!product.inStock}
                            >
                                Add
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};
export default ProductListItem;