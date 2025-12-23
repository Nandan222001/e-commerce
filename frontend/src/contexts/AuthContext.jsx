import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../store/slices/authSlice';
const AuthContext = createContext({});
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
export const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectCurrentUser);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        // Check if user is authenticated on mount
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');
                if (token && storedUser) {
                    // Verify token validity with backend
                    // You can add an API call here to verify the token
                    dispatch({
                        type: 'auth/setCredentials', payload: {
                            user: JSON.parse(storedUser), token,
                        },
                    });
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, [dispatch]);
    const value = {
        isAuthenticated, user, loading,
        // Add any additional auth helper functions here
        isAdmin: () => user?.roles?.includes('ADMIN'), isFinance: () => user?.roles?.includes('FINANCE'), isCustomer: () => user?.roles?.includes('CUSTOMER'), hasRole: (role) => user?.roles?.includes(role), isBusiness: () => user?.customerType === 'BUSINESS',
    };
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
export default AuthContext;