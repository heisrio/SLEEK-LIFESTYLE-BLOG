import { Navigate, useLocation } from 'react-router';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface RequireRoleProps {
  roles: Role[];
  children: ReactNode;
}

export const RequireRole = ({ roles, children }: RequireRoleProps) => {
  const { user, isBooting } = useAuth();
  const location = useLocation();

  if (isBooting) {
    return <div className="route-loader" aria-label="Checking your session" />;
  }

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};
