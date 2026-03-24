import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'becario')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si el usuario está pendiente o rechazado, no puede entrar
  if (user.estado !== 'activo') {
    return <Navigate to="/pending" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    // Redirigir a panel por defecto si no tiene permisos
    return <Navigate to={user.rol === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  return <>{children}</>;
};
