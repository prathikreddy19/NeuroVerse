import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('vbis_authenticated') === 'true';

  if (!isAuthenticated) {
    // Redirect to sign-in if not authenticated
    return <Navigate to="/signin" replace />;
  }

  // Render the protected component if authenticated
  return children;
};

export default ProtectedRoute;