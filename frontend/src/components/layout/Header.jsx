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
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart as CartIcon,
  Notifications as NotificationIcon,
  Search as SearchIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { logout, selectCurrentUser, selectIsAuthenticated } from '../../store/slices/authSlice';
import { selectCartItemsCount } from '../../store/slices/cartSlice';

/* =======================
   Styled Components
======================= */

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 999,
  backgroundColor: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.18)',
  marginLeft: theme.spacing(3),
  width: '100%',
  maxWidth: 420,
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.18)',
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
  color: 'rgba(255,255,255,0.8)',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: '#fff',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.2, 1, 1.2, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    '&::placeholder': {
      color: 'rgba(255,255,255,0.7)',
    },
  },
}));

/* =======================
   Component
======================= */

const Header = ({ onMenuClick, showMenuButton }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const cartItemsCount = useSelector(selectCartItemsCount);

  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await dispatch(logout());
    setAnchorEl(null);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Toolbar sx={{ minHeight: 72, px: { xs: 2, md: 4 } }}>
        {showMenuButton && (
          <IconButton
            onClick={onMenuClick}
            sx={{
              mr: 2,
              color: '#fff',
              backgroundColor: 'rgba(255,255,255,0.08)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.16)' },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Brand */}
        <Typography
          component={Link}
          to="/"
          sx={{
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: '1.25rem',
            letterSpacing: '-0.5px',
            background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Lumina
        </Typography>

        {/* Search */}
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <form onSubmit={handleSearch}>
            <StyledInputBase
              placeholder="Search products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </Search>

        <Box sx={{ flexGrow: 1 }} />

        {/* Right Actions */}
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Cart">
              <IconButton
                onClick={() => navigate('/cart')}
                sx={{
                  color: '#fff',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <Badge badgeContent={cartItemsCount} color="error">
                  <CartIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton
                onClick={(e) => setNotificationAnchor(e.currentTarget)}
                sx={{
                  color: '#fff',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Account">
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    fontSize: 14,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  }}
                  src={user?.avatar}
                >
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <>
            <Button
              onClick={() => navigate('/login')}
              sx={{ color: '#fff', textTransform: 'none' }}
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate('/register')}
              sx={{
                ml: 1,
                px: 3,
                borderRadius: 999,
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                color: '#fff',
              }}
            >
              Create Account
            </Button>
          </>
        )}
      </Toolbar>

      {/* Account Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 3,
            minWidth: 220,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography fontWeight={600}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => navigate('/profile')}>
          <PersonIcon sx={{ mr: 1 }} /> Profile
        </MenuItem>
        <MenuItem onClick={() => navigate('/orders')}>
          <ReceiptIcon sx={{ mr: 1 }} /> My Orders
        </MenuItem>
        {(user?.roles?.includes('ADMIN') || user?.roles?.includes('FINANCE')) && (
          <MenuItem onClick={() => navigate('/admin')}>
            <DashboardIcon sx={{ mr: 1 }} /> Dashboard
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} /> Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;
