import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole } from '../../store/slices/authSlice';

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const showSidebar = isAuthenticated && (userRole === 'ADMIN' || userRole === 'FINANCE');

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onMenuClick={handleDrawerToggle} showMenuButton={showSidebar} />
      
      <Box sx={{ display: 'flex', flex: 1 }}>
        {showSidebar && (
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            variant={isMobile ? 'temporary' : 'permanent'}
          />
        )}
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            ml: showSidebar && !isMobile ? '240px' : 0,
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Outlet />
        </Box>
      </Box>
      
      <Footer />
    </Box>
  );
};

export default Layout;