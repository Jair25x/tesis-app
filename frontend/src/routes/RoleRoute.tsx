import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

interface RoleRouteProps {
  roles: string[];
  children: ReactNode;
}

const RoleRoute = ({ roles, children }: RoleRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasRole = user?.roles.some((r) => roles.includes(r));

  if (!hasRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
