import React from 'react';
import {
    Box, Container, Typography, Button, Grid, Paper, Card, CardMedia, CardContent, Chip, IconButton, TextField
} from '@mui/material';
import {
    ArrowForward as ArrowForwardIcon, LocalShipping as ShippingIcon, Security as SecurityIcon,
    SupportAgent as SupportIcon, TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import productService from '../services/productService';
import ProductCard from '../components/products/ProductCard';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';
const HomePage = () => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const { data: featuredProducts } = useQuery(
        'featured-products', () => productService.getFeaturedProducts()
    );
    const { data: categories } = useQuery(
        'categories', () => productService.getCategories()
    );
    const { data: newArrivals } = useQuery(
        'new-arrivals', () => productService.getNewArrivals()
    );
    const banners = [
        {
            id: 1, image: '/images/banner1.jpg', title: 'Big Sale - Up to 50% Off', subtitle: 'On selected electronic items', buttonText: 'Shop Now', link: '/products?category=electronics',
        }, {
            id: 2, image: '/images/banner2.jpg', title: 'Business Solutions', subtitle: 'Special pricing for bulk orders', buttonText: 'Learn More', link: '/business',
        }, {
            id: 3, image: '/images/banner3.jpg', title: 'New Arrivals', subtitle: 'Check out the latest products', buttonText: 'Explore', link: '/products?sort=newest',
        },];
    const features = [
        {
            icon: <ShippingIcon fontSize="large" />, title: 'Free Shipping', description: 'On orders above ₹500',
        }, {
            icon: <SecurityIcon fontSize="large" />, title: 'Secure Payment', description: '100% secure transactions',
        }, {
            icon: <SupportIcon fontSize="large" />, title: '24/7 Support', description: 'Dedicated customer support',
        }, {
            icon: <TrendingIcon fontSize="large" />, title: 'Best Prices', description: 'Competitive pricing guaranteed',
        },];
    return (
        <Box>
            {/* Hero Section with Carousel */}
            <Box sx={{ mb: 4 }}>
                <Carousel
                    showArrows
                    autoPlay
                    infiniteLoop
                    showThumbs={false}
                    interval={5000}
                >
                    {banners.map((banner) => (
                        <Box
                            key={banner.id}
                            sx={{
                                position: 'relative', height: { xs: 300, md: 500 }, backgroundImage: `url(${banner.image})`, backgroundSize: 'cover',
                                backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <Box
                                sx={{
                                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)',
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'relative', textAlign: 'center', color: 'white', px: 3,
                                }}
                            >
                                <Typography variant="h2" component="h1" gutterBottom>
                                    {banner.title}
                                </Typography>
                                <Typography variant="h5" gutterBottom>
                                    {banner.subtitle}
                                </Typography>
                                <Button
                                    variant="contained" size="large" onClick={() => navigate(banner.link)}
                                    sx={{ mt: 2 }}
                                >
                                    {banner.buttonText}
                                </Button>
                            </Box>
                        </Box>
                    ))}
                </Carousel>
            </Box>
            <Container maxWidth="lg">
                {/* Features Section */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Paper
                                sx={{
                                    p: 3, textAlign: 'center', height: '100%', transition: 'transform 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                    },
                                }}
                                elevation={2}
                            >
                                <Box sx={{ color: 'primary.main', mb: 2 }}>
                                    {feature.icon}
                                </Box>
                                <Typography variant="h6" gutterBottom>
                                    {feature.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {feature.description}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
                {/* Categories Section */}
                <Box sx={{ mb: 6 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h4" component="h2">
                            Shop by Category
                        </Typography>
                        <Button
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => navigate('/products')}
                        >
                            View All
                        </Button>
                    </Box>
                    <Grid container spacing={3}>
                        {categories?.slice(0, 6).map((category) => (
                            <Grid item xs={6} sm={4} md={2} key={category.id}>
                                <Card
                                    sx={{
                                        cursor: 'pointer', transition: 'transform 0.3s',
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                        },
                                    }}
                                    onClick={() => navigate(`/products?category=${category.id}`)}
                                >
                                    <CardMedia
                                        component="img" height="120"
                                        image={category.imageUrl || '/images/category-placeholder.png'}
                                        alt={category.name}
                                    />
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="body1">
                                            {category.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {category.productCount} Products
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
                {/* Featured Products Section */}
                <Box sx={{ mb: 6 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h4" component="h2">
                            Featured Products
                        </Typography>
                        <Button
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => navigate('/products?featured=true')}
                        >
                            View All
                        </Button>
                    </Box>
                    <Grid container spacing={3}>
                        {featuredProducts?.slice(0, 4).map((product) => (
                            <Grid item xs={12} sm={6} md={3} key={product.id}>
                                <ProductCard product={product} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
                {/* New Arrivals Section */}
                <Box sx={{ mb: 6 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box>
                            <Typography variant="h4" component="h2">
                                New Arrivals
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Latest products added to our catalog
                            </Typography>
                        </Box>
                        <Button
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => navigate('/products?sort=newest')}
                        >
                            View All
                        </Button>
                    </Box>
                    <Grid container spacing={3}>
                        {newArrivals?.slice(0, 4).map((product) => (
                            <Grid item xs={12} sm={6} md={3} key={product.id}>
                                <ProductCard product={product} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
                {/* CTA Section */}
                {!isAuthenticated && (
                    <Paper
                        sx={{
                            p: 4, mb: 6, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', textAlign: 'center',
                        }}
                    >
                        <Typography variant="h4" gutterBottom>
                            Join Our Platform Today
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Get exclusive deals, business pricing, and more!
                        </Typography>
                        <Box sx={{ mt: 3 }}>
                            <Button
                                variant="contained" size="large" onClick={() => navigate('/register')}
                                sx={{
                                    backgroundColor: 'white', color: 'primary.main', mr: 2,
                                    '&:hover': {
                                        backgroundColor: 'grey.100',
                                    },
                                }}
                            >
                                Sign Up Now
                            </Button>
                            <Button
                                variant="outlined" size="large" onClick={() => navigate('/login')}
                                sx={{
                                    borderColor: 'white', color: 'white',
                                    '&:hover': {
                                        borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)',
                                    },
                                }}
                            >
                                Login
                            </Button>
                        </Box>
                    </Paper>
                )}
                {/* Newsletter Section */}
                <Paper sx={{ p: 4, textAlign: 'center', mb: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Subscribe to Our Newsletter
                    </Typography>
                    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 3 }}>
                        <Grid container spacing={1}>
                            <Grid item xs={8}>
                                {/* TextField will now work once imported */}
                                <TextField
                                    fullWidth
                                    placeholder="Enter your email"
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <Button fullWidth variant="contained">
                                    Subscribe
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};
export default HomePage;