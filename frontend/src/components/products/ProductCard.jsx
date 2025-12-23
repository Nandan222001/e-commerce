import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Visibility as ViewIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { selectCustomerType } from '../../store/slices/authSlice';
import { formatCurrency } from '../../utils/formatters';

const ProductCard = ({ product }) => {
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

  const calculateGST = () => {
    const price = getPrice();
    if (product.gstApplicable) {
      return price * (product.gstRate / 100);
    }
    return 0;
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={product.imageUrl || '/images/placeholder.png'}
        alt={product.name}
        sx={{ cursor: 'pointer' }}
        onClick={handleViewDetails}
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2" noWrap>
          {product.name}
        </Typography>
        
        {product.partNumber && (
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Part #: {product.partNumber}
          </Typography>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {product.description?.substring(0, 100)}...
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {product.inStock ? (
            <Chip label="In Stock" color="success" size="small" />
          ) : (
            <Chip label="Out of Stock" color="error" size="small" />
          )}
          
          {product.lowStock && (
            <Chip label="Low Stock" color="warning" size="small" />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" color="primary">
              {formatCurrency(getPrice())}
            </Typography>
            
            {customerType === 'BUSINESS' && product.businessPrice && (
              <Tooltip title="Business Price">
                <BusinessIcon color="action" fontSize="small" />
              </Tooltip>
            )}
          </Box>
          
          {product.gstApplicable && (
            <Typography variant="caption" color="text.secondary">
              + GST: {formatCurrency(calculateGST())} ({product.gstRate}%)
            </Typography>
          )}
          
          <Typography variant="body2" fontWeight="bold">
            Total: {formatCurrency(getPrice() + calculateGST())}
          </Typography>
        </Box>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<ViewIcon />}
          onClick={handleViewDetails}
        >
          View Details
        </Button>
        
        <Button
          size="small"
          variant="contained"
          startIcon={<CartIcon />}
          onClick={handleAddToCart}
          disabled={!product.inStock}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;