import React, { useState } from 'react';
import {
    Box, Grid, Typography, TextField, Button, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Paper, Alert, Divider,
} from '@mui/material';
import {
    CreditCard as CardIcon, AccountBalance as BankIcon, LocalAtm as CashIcon, PhoneAndroid as UpiIcon, ArrowBack as BackIcon, ArrowForward as NextIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
const paymentMethods = [
    { value: 'CREDIT_CARD', label: 'Credit Card', icon: <CardIcon /> }, { value: 'DEBIT_CARD', label: 'Debit Card', icon: <CardIcon /> }, { value: 'NET_BANKING', label: 'Net Banking', icon: <BankIcon /> }, { value: 'UPI', label: 'UPI', icon: <UpiIcon /> }, { value: 'COD', label: 'Cash on Delivery', icon: <CashIcon /> },];
const PaymentStep = ({ initialData, onNext, onBack }) => {
    const [paymentMethod, setPaymentMethod] = useState(initialData.paymentMethod || '');
    const cardValidationSchema = Yup.object({
        cardNumber: Yup.string()
            .required('Card number is required')
            .matches(/^[0-9]{16}$/, 'Card number must be 16 digits'), cardholderName: Yup.string().required('Cardholder name is required'), expiryMonth: Yup.string()
                .required('Expiry month is required')
                .matches(/^(0[1-9]|1[0-2])$/, 'Invalid month'), expiryYear: Yup.string()
                    .required('Expiry year is required')
                    .matches(/^[0-9]{2}$/, 'Invalid year'), cvv: Yup.string()
                        .required('CVV is required')
                        .matches(/^[0-9]{3,4}$/, 'CVV must be 3 or 4 digits'),
    });
    const upiValidationSchema = Yup.object({
        upiId: Yup.string()
            .required('UPI ID is required')
            .matches(/^[\w.-]+@[\w.-]+$/, 'Invalid UPI ID format'),
    });
    const formik = useFormik({
        initialValues: initialData.paymentDetails || {
            cardNumber: '', cardholderName: '', expiryMonth: '', expiryYear: '', cvv: '', upiId: '',
        }, validationSchema: paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD' ? cardValidationSchema
            : paymentMethod === 'UPI' ? upiValidationSchema
                : Yup.object(), onSubmit: (values) => {
                    const paymentData = {
                        paymentMethod,
                        paymentDetails: paymentMethod === 'COD' ? {} : values,
                    };
                    onNext(paymentData);
                },
    });
    const handlePaymentMethodChange = (event) => {
        setPaymentMethod(event.target.value);
        formik.resetForm();
    };
    const renderPaymentDetails = () => {
        switch (paymentMethod) {
            case 'CREDIT_CARD':
            case 'DEBIT_CARD':
                return (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Card Number" name="cardNumber" placeholder="1234 5678 9012 3456" value={formik.values.cardNumber}
                                onChange={formik.handleChange}
                                error={formik.touched.cardNumber && Boolean(formik.errors.cardNumber)}
                                helperText={formik.touched.cardNumber && formik.errors.cardNumber}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Cardholder Name" name="cardholderName" value={formik.values.cardholderName}
                                onChange={formik.handleChange}
                                error={formik.touched.cardholderName && Boolean(formik.errors.cardholderName)}
                                helperText={formik.touched.cardholderName && formik.errors.cardholderName}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Expiry Month" name="expiryMonth" placeholder="MM" value={formik.values.expiryMonth}
                                onChange={formik.handleChange}
                                error={formik.touched.expiryMonth && Boolean(formik.errors.expiryMonth)}
                                helperText={formik.touched.expiryMonth && formik.errors.expiryMonth}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Expiry Year" name="expiryYear" placeholder="YY" value={formik.values.expiryYear}
                                onChange={formik.handleChange}
                                error={formik.touched.expiryYear && Boolean(formik.errors.expiryYear)}
                                helperText={formik.touched.expiryYear && formik.errors.expiryYear}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="CVV" name="cvv" type="password" placeholder="123" value={formik.values.cvv}
                                onChange={formik.handleChange}
                                error={formik.touched.cvv && Boolean(formik.errors.cvv)}
                                helperText={formik.touched.cvv && formik.errors.cvv}
                            />
                        </Grid>
                    </Grid>
                );
            case 'UPI':
                return (
                    <TextField
                        fullWidth
                        label="UPI ID" name="upiId" placeholder="yourname@upi" value={formik.values.upiId}
                        onChange={formik.handleChange}
                        error={formik.touched.upiId && Boolean(formik.errors.upiId)}
                        helperText={formik.touched.upiId && formik.errors.upiId}
                        sx={{ mt: 2 }}
                    />
                );
            case 'NET_BANKING':
                return (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        You will be redirected to your bank's website to complete the payment. </Alert>
                );
            case 'COD':
                return (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        Cash on Delivery is available. Please keep the exact amount ready at the time of delivery. Additional charges of ₹50 apply for COD orders. </Alert>
                );
            default:
                return null;
        }
    };
    return (
        <form onSubmit={formik.handleSubmit}>
            <Typography variant="h5" gutterBottom>
                Payment Method
            </Typography>
            <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup value={paymentMethod} onChange={handlePaymentMethodChange}>
                    <Grid container spacing={2}>
                        {paymentMethods.map((method) => (
                            <Grid item xs={12} sm={6} key={method.value}>
                                <Paper
                                    sx={{
                                        p: 2, cursor: 'pointer', border: '2px solid', borderColor: paymentMethod === method.value ? 'primary.main' : 'divider',
                                        '&:hover': {
                                            borderColor: 'primary.light',
                                        },
                                    }}
                                    onClick={() => setPaymentMethod(method.value)}
                                >
                                    <FormControlLabel
                                        value={method.value}
                                        control={<Radio />}
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {method.icon}
                                                <Typography>{method.label}</Typography>
                                            </Box>
                                        }
                                    />
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </RadioGroup>
            </FormControl>
            {paymentMethod && (
                <>
                    <Divider sx={{ my: 3 }} />
                    {renderPaymentDetails()}
                </>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                    startIcon={<BackIcon />}
                    onClick={onBack}
                >
                    Back
                </Button>
                <Button
                    type="submit" variant="contained" endIcon={<NextIcon />}
                    disabled={!paymentMethod}
                >
                    Continue
                </Button>
            </Box>
        </form>
    );
};
export default PaymentStep;