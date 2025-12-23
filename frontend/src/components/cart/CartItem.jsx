import React from 'react';
import {
  Box,
  Grid,
  Typography,
  IconButton,
  TextField,
  Button,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { updateQuantity, removeFromCart } from '../../store/slices/cartSlice';
import { selectCustomerType } from '../../store/slices/authSlice';
import { formatCurrency } from '../../utils/formatters';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const customerType = useSelector(selectCustomerType);
  const { product, quantity } = item;

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity > 0 && newQuantity <= product.stockQuantity) {
      dispatch(updateQuantity({ productId: product.id, quantity: newQuantity }));
    }
  };

  const handleRemove = () => {
    dispatch(removeFromCart(product.id));
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
      return (price * quantity * product.gstRate) / 100;
    }
    return 0;
  };

  const totalPrice = getPrice() * quantity;
  const gstAmount = calculateGST();
  const finalPrice = totalPrice + gstAmount;

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={2}>
        <Box
          component="img"
          src={product.imageUrl || '/images/placeholder.png'}
          alt={product.name}
          sx={{
            width: '100%',
            height: 100,
            objectFit: 'cover',
            borderRadius: 1,
          }}
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <Typography variant="subtitle1" fontWeight="bold">
          {product.name}
        </Typography>
        {product.partNumber && (
          <Typography variant="caption" color="text.secondary">
            Part #: {product.partNumber}
          </Typography>
        )}
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

      <Grid item xs={12} sm={2}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            size="small"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
          >
            <RemoveIcon />
          </IconButton>
          <TextField
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            sx={{
              width: 50,
              mx: 1,
              '& .MuiInputBase-input': { textAlign: 'center', padding: '5px' },
            }}
            size="small"
          />
          <IconButton
            size="small"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= product.stockQuantity}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Grid>

      <Grid item xs={12} sm={3}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Price: {formatCurrency(getPrice())} × {quantity}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Subtotal: {formatCurrency(totalPrice)}
          </Typography>
          {product.gstApplicable && (
            <Typography variant="body2" color="text.secondary">
              GST ({product.gstRate}%): {formatCurrency(gstAmount)}
            </Typography>
          )}
          <Typography variant="subtitle1" fontWeight="bold" color="primary">
            Total: {formatCurrency(finalPrice)}
          </Typography>
        </Box>
      </Grid>

      <Grid item xs={12} sm={1}>
        <IconButton onClick={handleRemove} color="error">
          <DeleteIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default CartItem;