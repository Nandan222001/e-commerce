import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  Alert,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  ArrowBack as BackIcon,
  ArrowForward as CheckoutIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectCartItems,
  selectCartTotal,
  selectCartItemsCount,
  clearCart,
} from '../../store/slices/cartSlice';
import { selectCustomerType } from '../../store/slices/authSlice';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import EmptyCart from './EmptyCart';
import { formatCurrency } from '../../utils/formatters';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const itemsCount = useSelector(selectCartItemsCount);
  const customerType = useSelector(selectCustomerType);

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
    }
  };

  const calculateGST = () => {
    let totalGST = 0;
    cartItems.forEach((item) => {
      if (item.product.gstApplicable) {
        const price = customerType === 'BUSINESS' && item.product.businessPrice
          ? item.product.businessPrice
          : item.product.basePrice;
        totalGST += (price * item.quantity * item.product.gstRate) / 100;
      }
    });
    return totalGST;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Shopping Cart ({itemsCount} {itemsCount === 1 ? 'item' : 'items'})
        </Typography>
        
        <Button
          variant="outlined"
          color="error"
          onClick={handleClearCart}
        >
          Clear Cart
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            {customerType === 'BUSINESS' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                You are eligible for business pricing and GST invoicing.
              </Alert>
            )}
            
            {cartItems.map((item, index) => (
              <React.Fragment key={item.product.id}>
                <CartItem item={item} />
                {index < cartItems.length - 1 && <Divider sx={{ my: 2 }} />}
              </React.Fragment>
            ))}
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <CartSummary
            subtotal={cartTotal}
            gst={calculateGST()}
            total={cartTotal + calculateGST()}
            onCheckout={handleCheckout}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CartPage;