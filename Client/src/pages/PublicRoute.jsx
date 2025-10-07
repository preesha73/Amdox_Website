// In Client/src/pages/PublicRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = () => {
  const { token } = useAuth();
  // If token exists, redirect to home, otherwise show the page
  return token ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;