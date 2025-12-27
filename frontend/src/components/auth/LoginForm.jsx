import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from '@mui/icons-material';
import { login, selectAuthLoading } from '../../store/slices/authSlice';

/* ---------------- Validation ---------------- */
const validationSchema = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().min(6).required(),
});

export default function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectAuthLoading);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  /* ---------------- Parallax ---------------- */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const x = useTransform(mouseX, [-300, 300], [-20, 20]);
  const y = useTransform(mouseY, [-300, 300], [-20, 20]);

  useEffect(() => {
    const move = (e) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  /* ---------------- Formik ---------------- */
  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: async (values) => {
      const result = await dispatch(login({ ...values, rememberMe }));
      if (login.fulfilled.match(result)) navigate('/');
    },
  });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* ================= LEFT BRAND SECTION ================= */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          color: '#fff',
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          px: 8,
          background:
            'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
        }}
      >
        {/* Parallax Glow */}
        <motion.div style={{ x, y, position: 'absolute', inset: 0 }}>
          <Box
            sx={{
              position: 'absolute',
              width: 420,
              height: 420,
              borderRadius: '50%',
              background: 'rgba(99,102,241,0.25)',
              filter: 'blur(120px)',
              top: '15%',
              left: '10%',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: 360,
              height: 360,
              borderRadius: '50%',
              background: 'rgba(20,184,166,0.25)',
              filter: 'blur(120px)',
              bottom: '10%',
              right: '15%',
            }}
          />
        </motion.div>

        {/* Content */}
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                background: 'linear-gradient(135deg,#6366f1,#22d3ee)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 24,
              }}
            >
              L
            </Box>
          </motion.div>

          <Typography variant="h3" fontWeight={700} mt={6}>
            Welcome Back to <br />
            <span style={{ color: '#a5b4fc' }}>Lumina</span>
          </Typography>

          <Typography sx={{ mt: 2, opacity: 0.8, maxWidth: 420 }}>
            Access your dashboard, track orders, and manage your business
            securely with our platform.
          </Typography>

          <Typography sx={{ mt: 6, fontSize: 14, opacity: 0.6 }}>
            Trusted by 500+ businesses worldwide
          </Typography>
        </Box>
      </Box>

      {/* ================= RIGHT FORM SECTION ================= */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 460,
            p: 5,
            borderRadius: 3,
            background: '#ffffff',
          }}
        >
          <Typography variant="h4" fontWeight={700}>
            Sign In
          </Typography>

          <Typography sx={{ mt: 1, mb: 4, color: 'text.secondary' }}>
            New to Lumina?{' '}
            <Link to="/register" style={{ color: '#6366f1' }}>
              Create an account
            </Link>
          </Typography>

          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              margin="normal"
              {...formik.getFieldProps('email')}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              margin="normal"
              type={showPassword ? 'text' : 'password'}
              {...formik.getFieldProps('password')}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 2,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                }
                label="Remember me"
              />

              <Link to="/forgot-password" style={{ color: '#6366f1' }}>
                Forgot password?
              </Link>
            </Box>

            <Button
              fullWidth
              type="submit"
              size="large"
              disabled={loading}
              sx={{
                mt: 4,
                py: 1.6,
                fontWeight: 600,
                borderRadius: 2,
                background:
                  'linear-gradient(135deg,#0f172a,#1e293b)',
              }}
            >
              Sign In →
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}
