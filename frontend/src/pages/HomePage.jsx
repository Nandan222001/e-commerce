// src/pages/HomePage.jsx
import React, { useState } from 'react';
import {
    Box, Container, Typography, Button, Grid, Paper, Card, CardMedia, CardContent, CardActions, Chip, IconButton, useTheme, useMediaQuery, Skeleton,
    Stack, Avatar, Rating, Badge, Fade, Zoom, Grow, TextField
} from '@mui/material';
import {
    ArrowForward as ArrowForwardIcon, LocalShipping as ShippingIcon, Security as SecurityIcon, SupportAgent as SupportIcon, Payments as PaymentIcon, TrendingUp as TrendingIcon, ShoppingBag as ShoppingBagIcon, Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon, Star as StarIcon, Timer as TimerIcon, LocalOffer as OfferIcon, Category as CategoryIcon, AutoAwesome as NewIcon, KeyboardArrowLeft, KeyboardArrowRight,Email as  EmailIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import productService from '../services/productService';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { formatCurrency } from '../utils/formatters';
const AutoPlaySwipeableViews = autoPlay(SwipeableViews);
const HomePage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const [activeStep, setActiveStep] = useState(0);
    const [hoveredCard, setHoveredCard] = useState(null);
    const { data: featuredProducts, isLoading: featuredLoading } = useQuery(
        'featured-products', () => productService.getFeaturedProducts()
    );
    const { data: categories } = useQuery(
        'categories', () => productService.getCategories()
    );
    const { data: newArrivals } = useQuery(
        'new-arrivals', () => productService.getNewArrivals()
    );
    const { data: bestSellers } = useQuery(
        'best-sellers', () => productService.getProducts({ sort: 'bestselling', limit: 8 })
    );
    const banners = [
        {
            id: 1,
            image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1600',            title: 'Mega Sale Event',
            subtitle: 'Up to 70% Off on Electronics',
            description: 'Limited time offer on selected items',
            buttonText: 'Shop Now',
            link: '/products?category=electronics',
        },
        {
            id: 2,
            image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600',
            title: 'Business Solutions',
            subtitle: 'Exclusive B2B Pricing',
            description: 'Register as business customer for special rates',
            buttonText: 'Learn More',
            link: '/business',
        },
        {
            id: 3,
            image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1600',
            title: 'New Arrivals',
            subtitle: 'Latest Products Added',
            description: 'Be the first to explore new items',
            buttonText: 'Explore',
            link: '/products?sort=newest',
        },
    ];

    const features = [
        {
            icon: <ShippingIcon sx={{ fontSize: 40 }} />, title: 'Free Shipping', description: 'On orders above ₹500', color: '#4CAF50', bgColor: 'rgba(76, 175, 80, 0.1)',
        }, {
            icon: <SecurityIcon sx={{ fontSize: 40 }} />, title: 'Secure Payment', description: '100% secure transactions', color: '#2196F3', bgColor: 'rgba(33, 150, 243, 0.1)',
        }, {
            icon: <SupportIcon sx={{ fontSize: 40 }} />, title: '24/7 Support', description: 'Dedicated customer service', color: '#FF9800', bgColor: 'rgba(255, 152, 0, 0.1)',
        }, {
            icon: <PaymentIcon sx={{ fontSize: 40 }} />, title: 'Easy Returns', description: '30-day return policy',
            color: '#9C27B0', bgColor: 'rgba(156, 39, 176, 0.1)',
        },];
    const deals = [
        { discount: '50%', category: 'Electronics', endTime: '24:00:00', color: '#FF6B6B' }, { discount: '30%', category: 'Mechanical', endTime: '12:30:00', color: '#4ECDC4' }, { discount: '40%', category: 'Safety', endTime: '18:45:00', color: '#45B7D1' }, { discount: '25%', category: 'Tools', endTime: '06:15:00', color: '#96CEB4' },];
    const handleStepChange = (step) => {
        setActiveStep(step);
    };
    const handleNext = () => {
        setActiveStep((prevActiveStep) => (prevActiveStep + 1) % banners.length);
    };
    const handleBack = () => {
        setActiveStep((prevActiveStep) => (prevActiveStep - 1 + banners.length) % banners.length);
    };
    return (
        <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            {/* Hero Section with Modern Carousel */}
            <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                <AutoPlaySwipeableViews
                    axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                    index={activeStep}
                    onChangeIndex={handleStepChange}
                    enableMouseEvents
                    interval={5000}
                >
                    {banners.map((banner, index) => (
                        <Box
                            key={banner.id}
                            sx={{
                                height: { xs: 400, sm: 500, md: 600 }, position: 'relative', display: 'flex', alignItems: 'center', backgroundImage: `url(${banner.image})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay',
                            }}
                        >
                            <Container maxWidth="lg">
                                <Fade in={activeStep === index} timeout={1000}>
                                    <Grid container spacing={3} alignItems="center">
                                        <Grid item xs={12} md={6}>
                                            <Box sx={{ color: 'white', textAlign: { xs: 'center', md: 'left' } }}>
                                                <Chip
                                                    label="LIMITED OFFER" size="small" sx={{
                                                        backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', mb: 2, fontWeight: 'bold',
                                                    }}
                                                />
                                                <Typography
                                                    variant={isMobile ? 'h3' : 'h2'}
                                                    component="h1" fontWeight="bold" color="white" gutterBottom
                                                >
                                                    {banner.title}
                                                </Typography>
                                                <Typography
                                                    variant={isMobile ? 'h5' : 'h4'}
                                                    gutterBottom
                                                    sx={{ opacity: 1 }}
                                                    color="white"
                                                >
                                                    {banner.subtitle}
                                                </Typography>
                                                <Typography
                                                    variant="body1" sx={{ mb: 3, opacity: 1 }} color="white"
                                                >
                                                    {banner.description}
                                                </Typography>
                                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                                    <Button
                                                        variant="contained" size="large" endIcon={<ArrowForwardIcon />}
                                                        onClick={() => navigate(banner.link)}
                                                        sx={{
                                                            backgroundColor: 'white', color: theme.palette.primary.main, px: 4, py: 1.5, fontWeight: 'bold',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(255,255,255,0.9)', transform: 'translateY(-2px)',
                                                                boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                                                            }, transition: 'all 0.3s',
                                                        }}
                                                    >
                                                        {banner.buttonText}
                                                    </Button>
                                                    <Button
                                                        variant="outlined" size="large" sx={{
                                                            borderColor: 'white', color: 'white', px: 4, py: 1.5,
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'white',
                                                            },
                                                        }}
                                                    >
                                                        View Catalog
                                                    </Button>
                                                </Stack>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Fade>
                            </Container>
                        </Box>
                    ))}
                </AutoPlaySwipeableViews>
                {/* Carousel Navigation */}
                <IconButton
                    sx={{
                        position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                    }}
                    onClick={handleBack}
                >
                    <KeyboardArrowLeft />
                </IconButton>
                <IconButton
                    sx={{
                        position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                    }}
                    onClick={handleNext}
                >
                    <KeyboardArrowRight />
                </IconButton>
                {/* Carousel Indicators */}
                <Box
                    sx={{
                        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1,
                    }}
                >
                    {banners.map((_, index) => (
                        <Box
                            key={index}
                            onClick={() => setActiveStep(index)}
                            sx={{
                                width: activeStep === index ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: activeStep === index ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.3s',
                            }}
                        />
                    ))}
                </Box>
            </Box>
            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
                {/* Flash Deals Section */}
                <Box sx={{ mb: 8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <TimerIcon sx={{ fontSize: 32, color: '#FF6B6B', mr: 1 }} />
                        <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>
                            Flash Deals
                        </Typography>
                        <Button endIcon={<ArrowForwardIcon />} onClick={() => navigate('/deals')}>
                            View All Deals
                        </Button>
                    </Box>
                    <Grid container spacing={2}>
                        {deals.map((deal, index) => (
                            <Grid item xs={6} sm={3} key={index}>
                                <Grow in timeout={500 + index * 200}>
                                    <Paper
                                        sx={{
                                            p: 2, textAlign: 'center', background: `linear-gradient(135deg, ${deal.color}15 0%, ${deal.color}05 100%)`, border: `2px solid ${deal.color}20`, cursor: 'pointer', transition: 'all 0.3s',
                                            '&:hover': {
                                                transform: 'translateY(-5px)', boxShadow: `0 10px 30px ${deal.color}30`,
                                            },
                                        }}
                                        onClick={() => navigate(`/products?category=${deal.category.toLowerCase()}`)}
                                    >
                                        <Typography
                                            variant="h3"
                                            fontWeight="bold" sx={{ color: deal.color }}
                                        >
                                            {deal.discount}
                                        </Typography>
                                        <Typography variant="subtitle1" fontWeight="medium">
                                            {deal.category}
                                        </Typography>
                                        <Chip
                                            label={`Ends in ${deal.endTime}`}
                                            size="small" sx={{
                                                mt: 1, backgroundColor: `${deal.color}20`, color: deal.color, fontWeight: 'bold',
                                            }}
                                        />
                                    </Paper>
                                </Grow>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
                {/* Features Section with Modern Design */}
                <Box sx={{ mb: 8 }}>
                    <Grid container spacing={3}>
                        {features.map((feature, index) => (
                            <Grid item xs={6} md={3} key={index}>
                                <Zoom in timeout={500 + index * 100}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3, textAlign: 'center', backgroundColor: feature.bgColor, border: `1px solid ${feature.color}20`, borderRadius: 3, transition: 'all 0.3s', cursor: 'pointer',
                                            '&:hover': {
                                                transform: 'translateY(-10px)', boxShadow: `0 20px 40px ${feature.color}20`, backgroundColor: 'white',
                                            },
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                width: 80, height: 80, backgroundColor: feature.bgColor, color: feature.color, margin: '0 auto 16px',
                                            }}
                                        >
                                            {feature.icon}
                                        </Avatar>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            {feature.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {feature.description}
                                        </Typography>
                                    </Paper>
                                </Zoom>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
                {/* Categories Section with Image Cards */}
                <Box sx={{ mb: 8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Box>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                Shop by Category
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Browse our wide range of product categories
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined" endIcon={<CategoryIcon />}
                            onClick={() => navigate('/categories')}
                            sx={{ display: { xs: 'none', md: 'flex' } }}
                        >
                            All Categories
                        </Button>
                    </Box>
                    <Grid container spacing={3}>
                        {categories?.slice(0, 6).map((category, index) => (
                            <Grid item xs={6} sm={4} md={2} key={category.id}>
                                <Grow in timeout={500 + index * 100}>
                                    <Card
                                        sx={{
                                            cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                transform: 'translateY(-8px) scale(1.05)', boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
                                                '& .MuiCardMedia-root': {
                                                    transform: 'scale(1.1)',
                                                },
                                            },
                                        }}
                                        onClick={() => navigate(`/products?category=${category.id}`)}
                                    >
                                        <Box sx={{ overflow: 'hidden', height: 140 }}>
                                            <CardMedia
                                                component="img" height="140"
                                                image={category.imageUrl || `https://source.unsplash.com/400x300/?${category.name}`}
                                                alt={category.name}
                                                sx={{ transition: 'transform 0.3s' }}
                                            />
                                        </Box>
                                        <CardContent sx={{ textAlign: 'center', p: 2 }}>
                                            <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                                {category.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {category.productCount || 0} Products
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grow>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
                {/* Best Sellers Section */}
                <Box sx={{ mb: 8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Box>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                Best Sellers
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Our most popular products
                            </Typography>
                        </Box>
                        <Button
                            variant="contained" endIcon={<TrendingIcon />}
                            onClick={() => navigate('/products?sort=bestselling')}
                        >
                            View All
                        </Button>
                    </Box>
                    <Grid container spacing={3}>
                        {featuredLoading ? (
                            [...Array(4)].map((_, index) => (
                                <Grid item xs={12} sm={6} md={3} key={index}>
                                    <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 2 }} />
                                </Grid>
                            ))
                        ) : (
                            bestSellers?.content?.slice(0, 4).map((product, index) => (
                                <Grid item xs={12} sm={6} md={3} key={product.id}>
                                    <Fade in timeout={500 + index * 100}>
                                        <Card
                                            sx={{
                                                height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'all 0.3s',
                                                '&:hover': {
                                                    transform: 'translateY(-8px)',
                                                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                                                },
                                            }}
                                            onMouseEnter={() => setHoveredCard(product.id)}
                                            onMouseLeave={() => setHoveredCard(null)}
                                        >
                                            {/* Badges */}
                                            <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1 }}>
                                                <Chip
                                                    label="BESTSELLER" size="small" sx={{
                                                        backgroundColor: '#FF6B6B', color: 'white', fontWeight: 'bold',
                                                    }}
                                                />
                                            </Box>
                                            {/* Wishlist Button */}
                                            <IconButton
                                                sx={{
                                                    position: 'absolute', top: 10, right: 10,
                                                    backgroundColor: 'white', zIndex: 1,
                                                    '&:hover': { backgroundColor: 'white' },
                                                }}
                                            >
                                                <FavoriteBorderIcon />
                                            </IconButton>
                                            {/* Product Image */}
                                            <Box sx={{ position: 'relative', pt: '75%', overflow: 'hidden' }}>
                                                <CardMedia
                                                    component="img"
                                                    image={product.imageUrl || 'https://source.unsplash.com/400x400/?product'}
                                                    alt={product.name}
                                                    sx={{
                                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s', transform: hoveredCard === product.id ? 'scale(1.1)' : 'scale(1)',
                                                    }}
                                                />
                                            </Box>
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography variant="subtitle2" noWrap fontWeight="bold">
                                                    {product.name}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                    <Rating value={4.5} readOnly size="small" />
                                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                        (125)
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ mt: 2 }}>
                                                    <Typography variant="h6" color="primary" fontWeight="bold">
                                                        {formatCurrency(product.basePrice)}
                                                    </Typography>
                                                    {product.originalPrice && (
                                                        <Typography
                                                            variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}
                                                        >
                                                            {formatCurrency(product.originalPrice)}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </CardContent>
                                            <CardActions sx={{ p: 2, pt: 0 }}>
                                                <Button
                                                    fullWidth
                                                    variant="contained" startIcon={<ShoppingBagIcon />}
                                                    onClick={() => navigate(`/products/${product.id}`)}
                                                    sx={{
                                                        py: 1, fontWeight: 'bold',
                                                        '&:hover': {
                                                            transform: 'scale(1.05)',
                                                        }, transition: 'transform 0.2s',
                                                    }}
                                                >
                                                    Add to Cart
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Fade>
                                </Grid>
                            ))
                        )}
                    </Grid>
                </Box>
                {/* New Arrivals Section */}
                <Box sx={{ mb: 8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Box>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                New Arrivals
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Fresh products just added to our catalog
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined" endIcon={<NewIcon />}
                            onClick={() => navigate('/products?sort=newest')}
                        >
                            See More
                        </Button>
                    </Box>
                    <Grid container spacing={3}>
                        {newArrivals?.slice(0, 4).map((product, index) => (
                            <Grid item xs={12} sm={6} md={3} key={product.id}>
                                <Zoom in timeout={500 + index * 100}>
                                    <Card
                                        sx={{
                                            height: '100%', position: 'relative', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', transition: 'all 0.3s',
                                            '&:hover': {
                                                transform: 'translateY(-8px) rotateZ(-1deg)', boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
                                            },
                                        }}
                                    >
                                        <Chip
                                            label="NEW" size="small" sx={{
                                                position: 'absolute', top: 10, left: 10,
                                                backgroundColor: '#4CAF50', color: 'white', fontWeight: 'bold', zIndex: 1,
                                            }}
                                        />
                                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                                {product.name}
                                            </Typography>
                                            <Typography variant="h4" fontWeight="bold" sx={{ my: 2 }}>
                                                {formatCurrency(product.basePrice)}
                                            </Typography>
                                            <Button
                                                variant="contained" sx={{
                                                    backgroundColor: 'white', color: theme.palette.primary.main,
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255,255,255,0.9)',
                                                    },
                                                }}
                                                onClick={() => navigate(`/products/${product.id}`)}
                                            >
                                                Shop Now
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Zoom>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
                {/* CTA Section */}
                {!isAuthenticated && (
                    <Fade in timeout={1000}>
                        <Paper
                            sx={{
                                p: { xs: 4, md: 6 }, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', textAlign: 'center', borderRadius: 3, position: 'relative', overflow: 'hidden',
                            }}
                        >
                            {/* Background Pattern */}
                            <Box
                                sx={{
                                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill- rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h- 4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v- 4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                }}
                            />
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <OfferIcon sx={{ fontSize: 60, mb: 2 }} />
                                <Typography variant={isMobile ? 'h4' : 'h3'} fontWeight="bold" gutterBottom>
                                    Join Our Platform Today
                                </Typography>
                                <Typography variant="h6" sx={{ mb: 4, opacity: 1 }}>
                                    Get exclusive deals, business pricing, and member benefits!
                                </Typography>
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={2}
                                    justifyContent="center"
                                    alignItems="center" >
                                    <Button
                                        variant="contained" size="large" onClick={() => navigate('/register')}
                                        sx={{
                                            backgroundColor: 'white', color: theme.palette.primary.main, px: 4, py: 1.5, fontWeight: 'bold', fontSize: '1.1rem',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255,255,255,0.9)', transform: 'scale(1.05)',
                                            }, transition: 'all 0.3s',
                                        }}
                                    >
                                        Sign Up Now - It's Free
                                    </Button>
                                    <Button
                                        variant="outlined" size="large"
                                        onClick={() => navigate('/login')}
                                        sx={{
                                            borderColor: 'white', color: 'white', px: 4, py: 1.5, fontWeight: 'bold',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'white',
                                            },
                                        }}
                                    >
                                        Already a Member? Login
                                    </Button>
                                </Stack>
                            </Box>
                        </Paper>
                    </Fade>
                )}
                {/* Newsletter Section */}
                <Box sx={{ mt: 8, mb: 4 }}>
                    <Paper
                        sx={{
                            p: 4, textAlign: 'center', background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', border: '2px dashed', borderColor: 'primary.light', borderRadius: 3,
                        }}
                    >
                        <EmailIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            Stay Updated
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Subscribe to our newsletter and never miss a deal!
                        </Typography>
                        <Box
                            component="form" sx={{
                                display: 'flex', maxWidth: 500, mx: 'auto', gap: 1, flexDirection: { xs: 'column', sm: 'row' },
                            }}
                        >
                            <TextField
                                fullWidth
                                placeholder="Enter your email address" variant="outlined" sx={{ backgroundColor: 'white' }}
                            />
                            <Button
                                variant="contained" size="large" sx={{ px: 4, whiteSpace: 'nowrap' }}
                            >
                                Subscribe
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
};
export default HomePage;