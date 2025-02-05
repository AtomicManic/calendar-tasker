import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import AuthSuccess from './components/Auth/AuthSuccess';
import Dashboard from './components/Dashboard/Dashboard';
import { useAuth } from './hooks/useAuth';
import AuthCallback from './components/Auth/AuthCallback';

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
        />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;