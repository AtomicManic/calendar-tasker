import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {useAuth} from './../../hooks/useAuth';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return <div>Completing authentication...</div>;
};

export default AuthCallback;