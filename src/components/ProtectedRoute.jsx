import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function UnauthenticatedRedirect() {
  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-admin-login'));
    }, 120);
  }, []);
  return <Navigate to="/" replace />;
}

export default function ProtectedRoute() {
  const { session } = useAuth();

  if (!session) {
    return <UnauthenticatedRedirect />;
  }

  return <Outlet />;
}
