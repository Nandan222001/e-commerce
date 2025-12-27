// src/components/layout/Footer.jsx
import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  TextField,
  Button,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  YouTube as YouTubeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'About Us', path: '/about' },
      { label: 'Careers', path: '/careers' },
      { label: 'Press', path: '/press' },
      { label: 'Contact Us', path: '/contact' },
    ],
    customerService: [
      { label: 'Help Center', path: '/help' },
      { label: 'Track Order', path: '/track-order' },
      { label: 'Returns & Refunds', path: '/returns' },
      { label: 'Shipping Info', path: '/shipping' },
    ],
    policies: [
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Cookie Policy', path: '/cookies' },
      { label: 'Sitemap', path: '/sitemap' },
    ],
    categories: [
      { label: 'Electronics', path: '/products?category=electronics' },
      { label: 'Mechanical', path: '/products?category=mechanical' },
      { label: 'Electrical', path: '/products?category=electrical' },
      { label: 'Safety', path: '/products?category=safety' },
    ],
  };

  const socialLinks = [
    { icon: <FacebookIcon />, url: 'https://facebook.com' },
    { icon: <TwitterIcon />, url: 'https://twitter.com' },
    { icon: <InstagramIcon />, url: 'https://instagram.com' },
    { icon: <LinkedInIcon />, url: 'https://linkedin.com' },
    { icon: <YouTubeIcon />, url: 'https://youtube.com' },
  ];

  const sectionTitle = {
    color: 'white',
    fontWeight: 600,
    mb: 2,
  };

  const footerLink = {
    color: 'rgba(255,255,255,0.7)',
    display: 'block',
    mb: 1,
    textDecoration: 'none',
    '&:hover': {
      color: '#fff',
      transform: 'translateX(4px)',
    },
    transition: 'all 0.2s ease',
  };

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        pt: 6,
        pb: 3,
        background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
        color: 'rgba(255,255,255,0.8)',
      }}
    >
      <Container maxWidth="lg">
        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Brand */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              E-Commerce Platform
            </Typography>

            <Typography variant="body2" sx={{ mb: 2 }}>
              Your trusted partner for industrial and commercial needs.
              Quality products, competitive prices, and reliable service.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  size="small"
                  onClick={() => window.open(social.url, '_blank')}
                  sx={{
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.25)',
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Company */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography sx={sectionTitle}>Company</Typography>
            {footerLinks.company.map((link) => (
              <Link
                key={link.label}
                component="button"
                onClick={() => navigate(link.path)}
                sx={footerLink}
              >
                {link.label}
              </Link>
            ))}
          </Grid>

          {/* Customer Service */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography sx={sectionTitle}>Customer Service</Typography>
            {footerLinks.customerService.map((link) => (
              <Link
                key={link.label}
                component="button"
                onClick={() => navigate(link.path)}
                sx={footerLink}
              >
                {link.label}
              </Link>
            ))}
          </Grid>

          {/* Categories */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography sx={sectionTitle}>Categories</Typography>
            {footerLinks.categories.map((link) => (
              <Link
                key={link.label}
                component="button"
                onClick={() => navigate(link.path)}
                sx={footerLink}
              >
                {link.label}
              </Link>
            ))}
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography sx={sectionTitle}>Newsletter</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Subscribe for offers & updates
            </Typography>

            <Box sx={{ display: 'flex', mb: 2 }}>
              <TextField
                size="small"
                placeholder="Your email"
                fullWidth
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                sx={{
                  ml: 1,
                  borderRadius: 2,
                  px: 2,
                  background:
                    'linear-gradient(90deg, #6366f1, #8b5cf6)',
                }}
                endIcon={<SendIcon />}
              >
                Subscribe
              </Button>
            </Box>

            {/* Contact */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon sx={{ mr: 1, fontSize: 18 }} />
                <Typography variant="body2">
                  support@ecommerce.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneIcon sx={{ mr: 1, fontSize: 18 }} />
                <Typography variant="body2">
                  1-800-SHOP (7467)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <LocationIcon sx={{ mr: 1, fontSize: 18, mt: 0.5 }} />
                <Typography variant="body2">
                  123 Commerce Street
                  <br />
                  Business District
                  <br />
                  City, State 12345
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.15)' }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="body2">
            © {currentYear} E-Commerce Platform. All rights reserved.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {footerLinks.policies.map((link) => (
              <Link
                key={link.label}
                component="button"
                onClick={() => navigate(link.path)}
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  '&:hover': { color: '#fff' },
                }}
              >
                {link.label}
              </Link>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
