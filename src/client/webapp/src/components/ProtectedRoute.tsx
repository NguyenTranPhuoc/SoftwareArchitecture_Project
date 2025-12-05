import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    // Redirect to login if no token
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};
