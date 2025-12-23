import React from 'react';
import { Helmet } from 'react-helmet-async';
import RegisterForm from '../components/auth/RegisterForm';
const RegisterPage = () => {
    return (
        <>
            <Helmet>
                <title>Register - E-Commerce Platform</title>
            </Helmet>
            <RegisterForm />
        </>
    );
};
export default RegisterPage;