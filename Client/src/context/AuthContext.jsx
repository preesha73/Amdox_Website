// In Client/src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { setAuthToken } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setAuthToken(token);
    } else {
      localStorage.removeItem('token');
      setAuthToken(null);
    }
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};