import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isLoading } = useAppContext();
  const location = useLocation();

  // 1. Wait for the app to finish checking the token
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4EDE4]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#DCC7AA] border-t-[#A6754D] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#4E3B2C] font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  // 2. If not logged in, redirect to Login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. 🛠️ THE CRITICAL FIX: Role Check
  // If the route specifies allowed roles (e.g. ['admin', 'editor']), 
  // and the user's role is not in that list, redirect them to the homepage.
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // 4. If they pass all checks, render the page
  return children;
}

export default ProtectedRoute;