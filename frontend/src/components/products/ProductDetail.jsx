import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  Divider,
  Chip,
  Tab,
  Tabs,
  Rating,
  TextField,
  IconButton,
  Breadcrumbs,
  Link,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  FavoriteBorder as WishlistIcon,
  Share as ShareIcon,
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
  Assignment as SpecsIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { selectCustomerType } from '../../store/slices/authSlice';
import productService from '../../services/productService';
import { formatCurrency } from '../../utils/formatters';
import ImageGallery from '../common/ImageGallery';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const customerType = useSelector(selectCustomerType);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState(0);

  const { data: product, isLoading, error } = useQuery(
    ['product', id],
    () => productService.getProductById(id)
  );

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stockQuantity || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity }));
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ product, quantity }));
    navigate('/checkout');
  };

  const getPrice = () => {
    if (!product) return 0;
    if (customerType === 'BUSINESS' && product.businessPrice) {
      return product.businessPrice;
    }
    return product.basePrice;
  };

  const calculateGST = () => {
    const price = getPrice();
    if (product?.gstApplicable) {
      return price * (product.gstRate / 100);
    }
    return 0;
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" height={60} />
            <Skeleton variant="text" />
            <Skeleton variant="text" />
            <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Product not found or an error occurred.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/')}
          underline="hover"
        >
          Home
        </Link>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/products')}
          underline="hover"
        >
          Products
        </Link>
        {product.category && (
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate(`/products?category=${product.category.id}`)}
            underline="hover"
          >
            {product.category.name}
          </Link>
        )}
        <Typography variant="body2" color="text.primary">
          {product.name}
        </Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <ImageGallery images={product.imageUrls || ['/images/placeholder.png']} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {product.name}
            </Typography>

            {product.partNumber && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Part Number: {product.partNumber}
              </Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
              <Rating value={4.5} readOnly precision={0.5} />
              <Typography variant="body2" color="text.secondary">
                (245 reviews)
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              {product.inStock ? (
                <Chip label="In Stock" color="success" />
              ) : (
                <Chip label="Out of Stock" color="error" />
              )}
              {product.lowStock && (
                <Chip label={`Only ${product.stockQuantity} left`} color="warning" />
              )}
              {customerType === 'BUSINESS' && product.businessPrice && (
                <Chip label="Business Price" color="primary" />
              )}
            </Box>

            <Paper sx={{ p: 2, mb: 3, backgroundColor: 'grey.50' }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Price
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {formatCurrency(getPrice())}
                  </Typography>
                </Grid>
                {product.gstApplicable && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        GST ({product.gstRate}%)
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(calculateGST())}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Total Price
                      </Typography>
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {formatCurrency(getPrice() + calculateGST())}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                Quantity
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <IconButton onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                    <RemoveIcon />
                  </IconButton>
                  <TextField
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      if (val > 0 && val <= product.stockQuantity) {
                        setQuantity(val);
                      }
                    }}
                    sx={{ width: 60, '& .MuiInputBase-input': { textAlign: 'center' } }}
                    variant="standard"
                  />
                  <IconButton 
                    onClick={() => handleQuantityChange(1)} 
                    disabled={quantity >= product.stockQuantity}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {product.stockQuantity} available
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<CartIcon />}
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                Add to Cart
              </Button>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={handleBuyNow}
                disabled={!product.inStock}
              >
                Buy Now
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button startIcon={<WishlistIcon />} color="inherit">
                Add to Wishlist
              </Button>
              <Button startIcon={<ShareIcon />} color="inherit">
                Share
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShippingIcon color="action" />
                <Typography variant="body2">
                  Free shipping on orders over ₹500
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon color="action" />
                <Typography variant="body2">
                  Secure payment & 100% genuine products
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
          <Tab label="Description" />
          <Tab label="Specifications" />
          <Tab label="Reviews" />
          <Tab label="Shipping & Returns" />
        </Tabs>

        <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderTop: 0 }}>
          {selectedTab === 0 && (
            <Typography variant="body1">
              {product.description || 'No description available'}
            </Typography>
          )}
          
          {selectedTab === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Brand</Typography>
                <Typography variant="body1">{product.brand || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Manufacturer</Typography>
                <Typography variant="body1">{product.manufacturer || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Weight</Typography>
                <Typography variant="body1">{product.weight || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Dimensions</Typography>
                <Typography variant="body1">{product.dimensions || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Unit</Typography>
                <Typography variant="body1">{product.unit}</Typography>
              </Grid>
            </Grid>
          )}
          
          {selectedTab === 2 && (
            <Typography variant="body1">
              Reviews section to be implemented
            </Typography>
          )}
          
          {selectedTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>Shipping Information</Typography>
              <Typography variant="body1" paragraph>
                • Standard shipping: 3-5 business days
                • Express shipping: 1-2 business days
                • Free shipping on orders over ₹500
              </Typography>
              
              <Typography variant="h6" gutterBottom>Return Policy</Typography>
              <Typography variant="body1">
                • 30-day return policy
                • Items must be unused and in original packaging
                • Refund will be processed within 7-10 business days
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ProductDetail;