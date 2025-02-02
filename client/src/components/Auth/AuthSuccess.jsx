// src/pages/AuthSuccess.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AuthSuccess = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            // Simply navigate to dashboard after successful auth
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Setting Up Your Account</h2>
                <p>Please wait...</p>
            </div>
        </div>
    );
};

export default AuthSuccess;