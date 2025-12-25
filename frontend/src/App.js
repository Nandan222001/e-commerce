import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

import { store } from './store';
import { theme } from './styles/theme';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import PublicRoute from './components/auth/PublicRoute';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/common/LoadingScreen';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminInventory = lazy(() => import('./pages/admin/Inventory'));

// Finance Pages
const FinanceDashboard = lazy(() => import('./pages/finance/Dashboard'));
const FinanceInvoices = lazy(() => import('./pages/finance/Invoices'));
const FinanceReports = lazy(() => import('./pages/finance/Reports'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <CssBaseline />
              <Router>
                <AuthProvider>
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingScreen />}>
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Layout />}>
                          <Route index element={<HomePage />} />
                          <Route path="products" element={<ProductsPage />} />
                          <Route path="products/:id" element={<ProductDetailPage />} />
                          
                          {/* Auth Routes */}
                          <Route element={<PublicRoute />}>
                            <Route path="login" element={<LoginPage />} />
                            <Route path="register" element={<RegisterPage />} />
                          </Route>
                          
                          {/* Customer Routes */}
                          <Route element={<PrivateRoute roles={['CUSTOMER', 'ADMIN']} />}>
                            <Route path="cart" element={<CartPage />} />
                            <Route path="checkout" element={<CheckoutPage />} />
                            <Route path="orders" element={<OrdersPage />} />
                            <Route path="profile" element={<ProfilePage />} />
                          </Route>
                          
                          {/* Admin Routes */}
                          <Route path="admin" element={<PrivateRoute roles={['ADMIN']} />}>
                            <Route index element={<AdminDashboard />} />
                            <Route path="products" element={<AdminProducts />} />
                            <Route path="orders" element={<AdminOrders />} />
                            <Route path="users" element={<AdminUsers />} />
                            <Route path="inventory" element={<AdminInventory />} />
                          </Route>
                          
                          {/* Finance Routes */}
                          <Route path="finance" element={<PrivateRoute roles={['FINANCE', 'ADMIN']} />}>
                            <Route index element={<FinanceDashboard />} />
                            <Route path="invoices" element={<FinanceInvoices />} />
                            <Route path="reports" element={<FinanceReports />} />
                          </Route>
                          
                          {/* 404 Route */}
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Route>
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </AuthProvider>
              </Router>
              <Toaster position="top-right" />
            </LocalizationProvider>
          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </Provider>
    </HelmetProvider>
  );
}

export default App;