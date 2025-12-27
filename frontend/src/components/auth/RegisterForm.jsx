import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Grid,
  Paper,
  TextField,
  Typography,
  Button,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  Radio,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Business,
  Visibility,
  VisibilityOff,
  ArrowBack,
  ArrowForward
} from '@mui/icons-material';
import { register, selectAuthLoading } from '../../store/slices/authSlice';

/* ---------- STEPS ---------- */
const steps = ['Personal Info', 'Account Type', 'Security'];

/* ---------- VALIDATION SCHEMA ---------- */
const validationSchema = [
  Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phoneNumber: Yup.string()
      .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
      .required('Phone number is required'),
  }),
  Yup.object({
    customerType: Yup.string().required('Please select customer type'),
    companyName: Yup.string().when('customerType', {
      is: 'BUSINESS',
      then: Yup.string().required('Company name is required'),
    }),
    gstNumber: Yup.string().when('customerType', {
      is: 'BUSINESS',
      then: Yup.string()
        .matches(
          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
          'Invalid GST number'
        )
        .required('GST number is required'),
    }),
  }),
  Yup.object({
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
    acceptTerms: Yup.boolean()
      .oneOf([true], 'You must accept the terms and conditions')
      .required('You must accept the terms and conditions'),
  }),
];

const RegisterForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);

  const [activeStep, setActiveStep] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      customerType: '',
      companyName: '',
      gstNumber: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    validationSchema: validationSchema[activeStep],
    onSubmit: async (values) => {
      if (activeStep === steps.length - 1) {
        const { confirmPassword, acceptTerms, ...payload } = values;
        const res = await dispatch(register(payload));
        if (register.fulfilled.match(res)) navigate('/');
      } else {
        handleNext();
      }
    },
  });

  const inputStyle = {
    borderRadius: 3,
    background: '#fff',
  };

  const handleNext = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length === 0) {
      setActiveStep((s) => s + 1);
    } else {
      formik.setTouched(
        Object.keys(errors).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {})
      );
    }
  };

  const handleBack = () => setActiveStep((s) => s - 1);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Grid container minHeight="100vh">
        {/* LEFT BRAND PANEL */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            background: 'linear-gradient(135deg,#0f172a,#1e1b4b)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            px: { xs: 4, md: 8 },
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#4f46e5,#38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 700,
              mb: 4,
            }}
          >
            L
          </Box>

          <Typography variant="h3" fontWeight={700}>
            Welcome to <br />
            <span style={{ color: '#a5b4fc' }}>Lumina</span>
          </Typography>

          <Typography sx={{ mt: 2, maxWidth: 420, opacity: 0.85 }}>
            Create your account to manage orders, access dashboards and grow your
            business securely.
          </Typography>

          <Typography sx={{ mt: 6, fontSize: 14, opacity: 0.6 }}>
            Trusted by 500+ businesses worldwide
          </Typography>
        </Grid>

        {/* RIGHT FORM PANEL */}
        <Grid
          item
          xs={12}
          md={6}
          bgcolor="#f8fafc"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Paper
            sx={{
              width: '100%',
              maxWidth: 520,
              p: 5,
              borderRadius: 5,
            }}
          >
            <Typography variant="h4" fontWeight={700}>
              Create Account
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600 }}>
                Sign In
              </Link>
            </Typography>

            <Stepper activeStep={activeStep} sx={{ my: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <form onSubmit={formik.handleSubmit}>
              {/* STEP 1 */}
              {activeStep === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.firstName && Boolean(formik.errors.firstName)
                      }
                      helperText={
                        formik.touched.firstName && formik.errors.firstName
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                        ),
                        sx: inputStyle,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.lastName && Boolean(formik.errors.lastName)
                      }
                      helperText={formik.touched.lastName && formik.errors.lastName}
                      InputProps={{ sx: inputStyle }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        ),
                        sx: inputStyle,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phoneNumber"
                      value={formik.values.phoneNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.phoneNumber &&
                        Boolean(formik.errors.phoneNumber)
                      }
                      helperText={
                        formik.touched.phoneNumber && formik.errors.phoneNumber
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone />
                          </InputAdornment>
                        ),
                        sx: inputStyle,
                      }}
                    />
                  </Grid>
                </Grid>
              )}

              {/* STEP 2 */}
              {activeStep === 1 && (
                <>
                  <RadioGroup
                    name="customerType"
                    value={formik.values.customerType}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    {['INDIVIDUAL', 'BUSINESS'].map((type) => (
                      <Paper
                        key={type}
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 3,
                          border:
                            formik.values.customerType === type
                              ? '2px solid #4f46e5'
                              : '1px solid #ddd',
                        }}
                      >
                        <FormControlLabel value={type} control={<Radio />} label={type} />
                      </Paper>
                    ))}
                  </RadioGroup>
                  {formik.touched.customerType && formik.errors.customerType && (
                    <Typography color="error" variant="caption">
                      {formik.errors.customerType}
                    </Typography>
                  )}

                  {formik.values.customerType === 'BUSINESS' && (
                    <>
                      <TextField
                        fullWidth
                        label="Company Name"
                        name="companyName"
                        value={formik.values.companyName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.companyName &&
                          Boolean(formik.errors.companyName)
                        }
                        helperText={
                          formik.touched.companyName && formik.errors.companyName
                        }
                        sx={{ mt: 2 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Business />
                            </InputAdornment>
                          ),
                          sx: inputStyle,
                        }}
                      />
                      <TextField
                        fullWidth
                        label="GST Number"
                        name="gstNumber"
                        value={formik.values.gstNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.gstNumber && Boolean(formik.errors.gstNumber)}
                        helperText={formik.touched.gstNumber && formik.errors.gstNumber}
                        sx={{ mt: 2 }}
                        InputProps={{ sx: inputStyle }}
                      />
                    </>
                  )}
                </>
              )}

              {/* STEP 3 */}
              {activeStep === 2 && (
                <>
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={() => setShowPass(!showPass)}>
                          {showPass ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      ),
                      sx: inputStyle,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.confirmPassword &&
                      Boolean(formik.errors.confirmPassword)
                    }
                    helperText={
                      formik.touched.confirmPassword && formik.errors.confirmPassword
                    }
                    sx={{ mt: 2 }}
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={() => setShowConfirm(!showConfirm)}>
                          {showConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      ),
                      sx: inputStyle,
                    }}
                  />
                  <FormControlLabel
                    sx={{ mt: 2 }}
                    control={
                      <Checkbox
                        name="acceptTerms"
                        checked={formik.values.acceptTerms}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    }
                    label="I accept the Terms & Privacy Policy"
                  />
                  {formik.touched.acceptTerms && formik.errors.acceptTerms && (
                    <Typography color="error" variant="caption">
                      {formik.errors.acceptTerms}
                    </Typography>
                  )}
                </>
              )}

              {/* ACTION BUTTONS */}
              <Box display="flex" justifyContent="space-between" mt={4}>
                <Button
                  disabled={activeStep === 0}
                  startIcon={<ArrowBack />}
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={activeStep < 2 && <ArrowForward />}
                  disabled={loading}
                  sx={{
                    px: 4,
                    py: 1.4,
                    borderRadius: 999,
                    background: 'linear-gradient(135deg,#0f172a,#1e293b)',
                  }}
                >
                  {loading ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : activeStep === 2 ? (
                    'Create Account'
                  ) : (
                    'Next'
                  )}
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RegisterForm;
