import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Paper,
  Divider,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import addressService from '../../services/addressService';

const validationSchema = Yup.object({
  shippingAddress: Yup.object({
    addressLine1: Yup.string().required('Address is required'),
    addressLine2: Yup.string(),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    postalCode: Yup.string()
      .matches(/^[0-9]{6}$/, 'Postal code must be 6 digits')
      .required('Postal code is required'),
    country: Yup.string().required('Country is required'),
  }),
  billingAddress: Yup.object().when('sameAsShipping', {
    is: false,
    then: Yup.object({
      addressLine1: Yup.string().required('Address is required'),
      addressLine2: Yup.string(),
      city: Yup.string().required('City is required'),
      state: Yup.string().required('State is required'),
      postalCode: Yup.string()
        .matches(/^[0-9]{6}$/, 'Postal code must be 6 digits')
        .required('Postal code is required'),
      country: Yup.string().required('Country is required'),
    }),
  }),
});

const AddressStep = ({ initialData, onNext }) => {
  const user = useSelector(selectCurrentUser);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState('');
  const [selectedBillingAddress, setSelectedBillingAddress] = useState('');
  const [useNewShipping, setUseNewShipping] = useState(false);
  const [useNewBilling, setUseNewBilling] = useState(false);

  const { data: savedAddresses = [] } = useQuery(
    ['addresses', user?.id],
    () => addressService.getUserAddresses(),
    { enabled: !!user }
  );

  const formik = useFormik({
    initialValues: {
     
      sameAsShipping: true,
      shippingAddress: initialData.shippingAddress || {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
      },
      billingAddress: initialData.billingAddress || {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
      },
    },
    validationSchema,
    onSubmit: (values) => {
      const data = {
        shippingAddress: values.shippingAddress,
        billingAddress: values.sameAsShipping 
          ? values.shippingAddress 
          : values.billingAddress,
      };
      onNext(data);
    },
  });

  const handleSelectSavedAddress = (addressId, type) => {
    const address = savedAddresses.find(a => a.id === addressId);
    if (address) {
      if (type === 'shipping') {
        formik.setFieldValue('shippingAddress', {
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        });
      } else {
        formik.setFieldValue('billingAddress', {
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        });
      }
    }
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <Box>
        <Typography variant="h5" gutterBottom>
          Delivery Address
        </Typography>

        {savedAddresses.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Select from saved addresses
            </Typography>
            <RadioGroup
              value={selectedShippingAddress}
              onChange={(e) => {
                setSelectedShippingAddress(e.target.value);
                setUseNewShipping(e.target.value === 'new');
                if (e.target.value !== 'new') {
                  handleSelectSavedAddress(e.target.value, 'shipping');
                }
              }}
            >
              {savedAddresses.map((address) => (
                <Paper key={address.id} sx={{ p: 2, mb: 1 }}>
                  <FormControlLabel
                    value={address.id}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body2">
                          {address.addressLine1}, {address.addressLine2}
                        </Typography>
                        <Typography variant="body2">
                          {address.city}, {address.state} - {address.postalCode}
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
              ))}
              <FormControlLabel
                value="new"
                control={<Radio />}
                label="Add new address"
              />
            </RadioGroup>
          </Box>
        )}

        {(useNewShipping || savedAddresses.length === 0) && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 1"
                name="shippingAddress.addressLine1"
                value={formik.values.shippingAddress.addressLine1}
                onChange={formik.handleChange}
                error={
                  formik.touched.shippingAddress?.addressLine1 &&
                  Boolean(formik.errors.shippingAddress?.addressLine1)
                }
                helperText={
                  formik.touched.shippingAddress?.addressLine1 &&
                  formik.errors.shippingAddress?.addressLine1
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 2 (Optional)"
                name="shippingAddress.addressLine2"
                value={formik.values.shippingAddress.addressLine2}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="shippingAddress.city"
                value={formik.values.shippingAddress.city}
                onChange={formik.handleChange}
                error={
                  formik.touched.shippingAddress?.city &&
                  Boolean(formik.errors.shippingAddress?.city)
                }
                helperText={
                  formik.touched.shippingAddress?.city &&
                  formik.errors.shippingAddress?.city
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                name="shippingAddress.state"
                value={formik.values.shippingAddress.state}
                onChange={formik.handleChange}
                error={
                  formik.touched.shippingAddress?.state &&
                  Boolean(formik.errors.shippingAddress?.state)
                }
                helperText={
                  formik.touched.shippingAddress?.state &&
                  formik.errors.shippingAddress?.state
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                name="shippingAddress.postalCode"
                value={formik.values.shippingAddress.postalCode}
                onChange={formik.handleChange}
                error={
                  formik.touched.shippingAddress?.postalCode &&
                  Boolean(formik.errors.shippingAddress?.postalCode)
                }
                helperText={
                  formik.touched.shippingAddress?.postalCode &&
                  formik.errors.shippingAddress?.postalCode
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                name="shippingAddress.country"
                value={formik.values.shippingAddress.country}
                onChange={formik.handleChange}
                disabled
              />
            </Grid>
          </Grid>
        )}

        <Divider sx={{ my: 3 }} />

        <FormControlLabel
          control={
            <Checkbox
              checked={formik.values.sameAsShipping}
              onChange={formik.handleChange}
              name="sameAsShipping"
            />
          }
          label="Billing address same as shipping address"
        />

        {!formik.values.sameAsShipping && (
          <>
            <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
              Billing Address
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address Line 1"
                  name="billingAddress.addressLine1"
                  value={formik.values.billingAddress.addressLine1}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.billingAddress?.addressLine1 &&
                    Boolean(formik.errors.billingAddress?.addressLine1)
                  }
                  helperText={
                    formik.touched.billingAddress?.addressLine1 &&
                    formik.errors.billingAddress?.addressLine1
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address Line 2 (Optional)"
                  name="billingAddress.addressLine2"
                  value={formik.values.billingAddress.addressLine2}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="billingAddress.city"
                  value={formik.values.billingAddress.city}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.billingAddress?.city &&
                    Boolean(formik.errors.billingAddress?.city)
                  }
                  helperText={
                    formik.touched.billingAddress?.city &&
                    formik.errors.billingAddress?.city
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  name="billingAddress.state"
                  value={formik.values.billingAddress.state}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.billingAddress?.state &&
                    Boolean(formik.errors.billingAddress?.state)
                  }
                  helperText={
                    formik.touched.billingAddress?.state &&
                    formik.errors.billingAddress?.state
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  name="billingAddress.postalCode"
                  value={formik.values.billingAddress.postalCode}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.billingAddress?.postalCode &&
                    Boolean(formik.errors.billingAddress?.postalCode)
                  }
                  helperText={
                    formik.touched.billingAddress?.postalCode &&
                    formik.errors.billingAddress?.postalCode
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="billingAddress.country"
                  value={formik.values.billingAddress.country}
                  onChange={formik.handleChange}
                  disabled
                />
              </Grid>
            </Grid>
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button type="submit" variant="contained" size="large">
            Continue to Payment
          </Button>
        </Box>
      </Box>
    </form>
  );
};

export default AddressStep;