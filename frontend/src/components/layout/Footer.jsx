// src/components/layout/Footer.jsx
import React from 'react';
import {
    Box, Container, Grid, Typography,
    Link, IconButton, Divider, TextField, Button,
} from '@mui/material';
import {
    Facebook as FacebookIcon, Twitter as TwitterIcon, Instagram as InstagramIcon, LinkedIn as LinkedInIcon, YouTube as YouTubeIcon, Email as EmailIcon, Phone as PhoneIcon, LocationOn as LocationIcon, Send as SendIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
const Footer = () => {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();
    const footerLinks = {
        company: [
            { label: 'About Us', path: '/about' }, { label: 'Careers', path: '/careers' }, { label: 'Press', path: '/press' }, { label: 'Contact Us', path: '/contact' },], customerService: [
                { label: 'Help Center', path: '/help' }, { label: 'Track Order', path: '/track-order' }, { label: 'Returns & Refunds', path: '/returns' }, { label: 'Shipping Info', path: '/shipping' },], policies: [
                    { label: 'Privacy Policy', path: '/privacy' }, { label: 'Terms of Service', path: '/terms' }, { label: 'Cookie Policy', path: '/cookies' }, { label: 'Sitemap', path: '/sitemap' },], categories: [
                        { label: 'Electronics', path: '/products?category=electronics' }, { label: 'Mechanical', path: '/products?category=mechanical' }, { label: 'Electrical', path: '/products?category=electrical' }, { label: 'Safety', path: '/products?category=safety' },],
    };
    const socialLinks = [
        { icon: <FacebookIcon />, url: 'https://facebook.com' }, { icon: <TwitterIcon />, url: 'https://twitter.com' }, { icon: <InstagramIcon />, url: 'https://instagram.com' }, { icon: <LinkedInIcon />, url: 'https://linkedin.com' }, { icon: <YouTubeIcon />, url: 'https://youtube.com' },];
    return (
        <Box
            component="footer" sx={{
                backgroundColor: 'grey.900', color: 'grey.300', mt: 'auto', py: 4,
            }}
        >
            <Container maxWidth="lg">
                {/* Main Footer Content */}
                <Grid container spacing={4}>
                    {/* Company Info */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                            E-Commerce Platform
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Your trusted partner for all industrial and commercial needs. Quality products, competitive prices, and excellent service. </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {socialLinks.map((social, index) => (
                                <IconButton
                                    key={index}
                                    size="small" sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}
                                    onClick={() => window.open(social.url, '_blank')}
                                >
                                    {social.icon}
                                </IconButton>
                            ))}
                        </Box>
                    </Grid>
                    {/* Quick Links */}
                    <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                            Company
                        </Typography>
                        {footerLinks.company.map((link) => (
                            <Link
                                key={link.label}
                                component="button" variant="body2" onClick={() => navigate(link.path)}
                                sx={{
                                    color: 'grey.400', display: 'block', mb: 1, textDecoration: 'none',
                                    '&:hover': { color: 'white' },
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                            Customer Service
                        </Typography>
                        {footerLinks.customerService.map((link) => (
                            <Link
                                key={link.label}
                                component="button"
                                variant="body2" onClick={() => navigate(link.path)}
                                sx={{
                                    color: 'grey.400', display: 'block', mb: 1, textDecoration: 'none',
                                    '&:hover': { color: 'white' },
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                            Categories
                        </Typography>
                        {footerLinks.categories.map((link) => (
                            <Link
                                key={link.label}
                                component="button" variant="body2" onClick={() => navigate(link.path)}
                                sx={{
                                    color: 'grey.400', display: 'block', mb: 1, textDecoration: 'none',
                                    '&:hover': { color: 'white' },
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </Grid>
                    {/* Newsletter */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                            Newsletter
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Subscribe to get special offers and updates
                        </Typography>
                        <Box sx={{ display: 'flex', mb: 2 }}>
                            <TextField
                                size="small" placeholder="Your email"
                                variant="outlined" sx={{
                                    flex: 1, backgroundColor: 'grey.800',
                                    '& .MuiOutlinedInput-root': {
                                        color: 'white',
                                        '& fieldset': {
                                            borderColor: 'grey.700',
                                        },
                                    },
                                }}
                            />
                            <Button
                                variant="contained" sx={{ ml: 1 }}
                                endIcon={<SendIcon />}
                            >
                                Subscribe
                            </Button>
                        </Box>
                        {/* Contact Info */}
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <EmailIcon sx={{ mr: 1, fontSize: 18 }} />
                                <Typography variant="body2">support@ecommerce.com</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <PhoneIcon sx={{ mr: 1, fontSize: 18 }} />
                                <Typography variant="body2">1-800-SHOP (7467)</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                <LocationIcon sx={{ mr: 1, fontSize: 18, mt: 0.5 }} />
                                <Typography variant="body2">
                                    123 Commerce Street,<br />
                                    Business District,<br />
                                    City, State 12345
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
                <Divider sx={{ my: 3, borderColor: 'grey.700' }} />
                {/* Bottom Footer */}
                <Box
                    sx={{
                        display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between', alignItems: 'center',
                    }}
                >
                    <Typography variant="body2" sx={{ mb: { xs: 1, sm: 0 } }}>
                        © {currentYear} E-Commerce Platform. All rights reserved. </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {footerLinks.policies.map((link, index) => (
                            <React.Fragment key={link.label}>
                                <Link
                                    component="button" variant="body2" onClick={() => navigate(link.path)}
                                    sx={{
                                        color: 'grey.400', textDecoration: 'none',
                                        '&:hover': { color: 'white' },
                                    }}
                                >
                                    {link.label}
                                </Link>
                                {index < footerLinks.policies.length - 1 && (
                                    <Typography variant="body2" sx={{ color: 'grey.600' }}>
                                        |
                                    </Typography>
                                )}
                            </React.Fragment>
                        ))}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};
export default Footer;