import React, { useState } from 'react';
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCartItems, selectCartTotal } from '../../store/slices/cartSlice';
import AddressStep from './AddressStep';
import PaymentStep from './PaymentStep';
import ReviewStep from './ReviewStep';
import OrderConfirmation from './OrderConfirmation';

const steps = ['Shipping Address', 'Payment Method', 'Review Order'];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  
  const [activeStep, setActiveStep] = useState(0);
  const [orderData, setOrderData] = useState({
    shippingAddress: null,
    billingAddress: null,
    paymentMethod: '',
    paymentDetails: {},
    customerNotes: '',
  });
  const [orderConfirmation, setOrderConfirmation] = useState(null);

  if (cartItems.length === 0 && !orderConfirmation) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Your cart is empty. Please add items before checkout.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/products')}
          sx={{ mt: 2 }}
        >
          Continue Shopping
        </Button>
      </Box>
    );
  }

  const handleNext = (data) => {
    setOrderData({ ...orderData, ...data });
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePlaceOrder = async (finalData) => {
    try {
      // Simulate order placement
      const order = {
        ...orderData,
        ...finalData,
        orderNumber: `ORD-${Date.now()}`,
        items: cartItems,
        total: cartTotal,
      };
      
      // Here you would call the API to place the order
      // const response = await orderService.createOrder(order);
      
      setOrderConfirmation(order);
      setActiveStep(activeStep + 1);
    } catch (error) {
      console.error('Failed to place order:', error);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <AddressStep
            initialData={{
              shippingAddress: orderData.shippingAddress,
              billingAddress: orderData.billingAddress,
            }}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <PaymentStep
            initialData={{
              paymentMethod: orderData.paymentMethod,
              paymentDetails: orderData.paymentDetails,
            }}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <ReviewStep
            orderData={orderData}
            cartItems={cartItems}
            onPlaceOrder={handlePlaceOrder}
            onBack={handleBack}
          />
        );
      case 3:
        return <OrderConfirmation order={orderConfirmation} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center">
        Checkout
      </Typography>

      {activeStep < 3 && (
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      <Paper sx={{ p: 3 }}>
        {getStepContent(activeStep)}
      </Paper>
    </Box>
  );
};

export default CheckoutPage;