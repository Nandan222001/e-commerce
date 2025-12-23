import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Button,
  Avatar,
  Tooltip,
  InputBase,
  Paper,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart as CartIcon,
  AccountCircle as AccountIcon,
  Notifications as NotificationIcon,
  Search as SearchIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { logout, selectCurrentUser, selectIsAuthenticated } from '../../store/slices/authSlice';
import { selectCartItemsCount } from '../../store/slices/cartSlice';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

const Header = ({ onMenuClick, showMenuButton }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const cartItemsCount = useSelector(selectCartItemsCount);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = async () => {
    await dispatch(logout());
    handleMenuClose();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const isMenuOpen = Boolean(anchorEl);

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        {showMenuButton && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h6"
          noWrap
          component={Link}
          to="/"
          sx={{
            display: { xs: 'none', sm: 'block' },
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold',
          }}
        >
          E-Commerce Platform
        </Typography>

        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <form onSubmit={handleSearch}>
            <StyledInputBase
              placeholder="Search products…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </Search>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAuthenticated ? (
            <>
              <Tooltip title="Cart">
                <IconButton
                  color="inherit"
                  onClick={() => navigate('/cart')}
                >
                  <Badge badgeContent={cartItemsCount} color="error">
                    <CartIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Notifications">
                <IconButton
                  color="inherit"
                  onClick={handleNotificationClick}
                >
                  <Badge badgeContent={3} color="error">
                    <NotificationIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Account">
                <IconButton
                  edge="end"
                  aria-label="account of current user"
                  aria-controls="primary-search-account-menu"
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                >
                  <Avatar
                    sx={{ width: 32, height: 32 }}
                    src={user?.avatar}
                  >
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button
                color="inherit"
                variant="outlined"
                onClick={() => navigate('/register')}
                sx={{ borderColor: 'white' }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        id="primary-search-account-menu"
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
          <PersonIcon sx={{ mr: 1 }} /> Profile
        </MenuItem>
        <MenuItem onClick={() => { navigate('/orders'); handleMenuClose(); }}>
          <ReceiptIcon sx={{ mr: 1 }} /> My Orders
        </MenuItem>
        {(user?.roles?.includes('ADMIN') || user?.roles?.includes('FINANCE')) && (
          <MenuItem onClick={() => { navigate('/admin'); handleMenuClose(); }}>
            <DashboardIcon sx={{ mr: 1 }} /> Dashboard
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} /> Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleNotificationClose}>
          <Box>
            <Typography variant="body2">Order #12345 has been shipped</Typography>
            <Typography variant="caption" color="text.secondary">2 hours ago</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationClose}>
          <Box>
            <Typography variant="body2">New product added to wishlist</Typography>
            <Typography variant="caption" color="text.secondary">5 hours ago</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationClose}>
          <Box>
            <Typography variant="body2">Price drop on items in your cart</Typography>
            <Typography variant="caption" color="text.secondary">1 day ago</Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { navigate('/notifications'); handleNotificationClose(); }}>
          <Typography variant="body2" color="primary" align="center" sx={{ width: '100%' }}>
            View all notifications
          </Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;