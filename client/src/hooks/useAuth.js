// src/hooks/useAuth.js
import { useState, useEffect } from "react";

const AUTH_ENDPOINT = "localhost:8081/auth";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = getToken();
    setIsAuthenticated(!!token);
    setLoading(false);
  };

  const getToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth="))
      ?.split("=")[1];
  };

  const login = () => {
    window.location.href = AUTH_ENDPOINT;
  };

  const logout = () => {
    // Remove cookie and reset state
    document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    loading,
    login,
    logout,
    getToken,
  };
};
