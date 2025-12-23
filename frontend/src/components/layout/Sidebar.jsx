import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as OrdersIcon,
  Inventory as InventoryIcon,
  People as UsersIcon,
  Receipt as InvoicesIcon,
  Analytics as ReportsIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Category as CategoryIcon,
  LocalShipping as ShippingIcon,
  AccountBalance as FinanceIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../../store/slices/authSlice';

const drawerWidth = 240;

const Sidebar = ({ open, onClose, variant }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = useSelector(selectUserRole);
  const [expandedItems, setExpandedItems] = useState({});

  const handleExpandClick = (item) => {
    setExpandedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: userRole === 'FINANCE' ? '/finance' : '/admin',
      icon: <DashboardIcon />,
      roles: ['ADMIN', 'FINANCE'],
    },
    {
      title: 'Products',
      icon: <CategoryIcon />,
      roles: ['ADMIN'],
      children: [
        { title: 'All Products', path: '/admin/products' },
        { title: 'Categories', path: '/admin/categories' },
        { title: 'Add Product', path: '/admin/products/new' },
      ],
    },
    {
      title: 'Orders',
      path: '/admin/orders',
      icon: <OrdersIcon />,
      roles: ['ADMIN'],
      badge: '5',
    },
    {
      title: 'Inventory',
      path: '/admin/inventory',
      icon: <InventoryIcon />,
      roles: ['ADMIN'],
    },
    {
      title: 'Users',
      path: '/admin/users',
      icon: <UsersIcon />,
      roles: ['ADMIN'],
    },
    {
      title: 'Finance',
      icon: <FinanceIcon />,
      roles: ['ADMIN', 'FINANCE'],
      children: [
        { title: 'Dashboard', path: '/finance' },
        { title: 'Invoices', path: '/finance/invoices' },
        { title: 'Reports', path: '/finance/reports' },
        { title: 'Tax Summary', path: '/finance/tax' },
      ],
    },
    {
      title: 'Shipping',
      path: '/admin/shipping',
      icon: <ShippingIcon />,
      roles: ['ADMIN'],
    },
    {
      title: 'Reports',
      icon: <ReportsIcon />,
      roles: ['ADMIN', 'FINANCE'],
      children: [
        { title: 'Sales Report', path: '/reports/sales' },
        { title: 'Product Report', path: '/reports/products' },
        { title: 'Customer Report', path: '/reports/customers' },
        { title: 'Financial Report', path: '/reports/financial' },
      ],
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: <SettingsIcon />,
      roles: ['ADMIN'],
    },
  ];

  const filterMenuItems = (items) => {
    return items.filter((item) => item.roles.includes(userRole));
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          mt: '64px',
        },
      }}
      variant={variant}
      anchor="left"
      open={open}
      onClose={onClose}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          {userRole === 'FINANCE' ? 'Finance Panel' : 'Admin Panel'}
        </Typography>
      </Box>
      
      <Divider />
      
      <List>
        {filterMenuItems(menuItems).map((item) => (
          <React.Fragment key={item.title}>
            {item.children ? (
              <>
                <ListItemButton onClick={() => handleExpandClick(item.title)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.title} />
                  {expandedItems[item.title] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={expandedItems[item.title]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.title}
                        sx={{ pl: 4 }}
                        selected={isActive(child.path)}
                        onClick={() => navigate(child.path)}
                      >
                        <ListItemText primary={child.title} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} />
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    color="error"
                    sx={{ ml: 'auto' }}
                  />
                )}
              </ListItemButton>
            )}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;