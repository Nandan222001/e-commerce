import React from 'react';
import { Helmet } from 'react-helmet-async';
import LoginForm from '../components/auth/LoginForm';
const LoginPage = () => {
    return (
        <>
            <Helmet>
                <title>Login - E-Commerce Platform</title>
            </Helmet>
            <LoginForm />
        </>
    );
};
export default LoginPage;