// src/routes/RoleRoute.tsx
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useStudentView } from "../context/useStudentView";

interface RoleRouteProps {
  roles: string[];
  children: ReactNode;
}

const RoleRoute = ({ roles, children }: RoleRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const { isStudentView } = useStudentView(); // ⬅️  NUEVO

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // ✅ 1) Rol directo
  const hasDirectRole = user?.roles.some((r) => roles.includes(r));

  // ✅ 2) Acceso a STUDENT por modo simulación
  const hasImpersonatedRole = roles.includes("ROLE_STUDENT") && isStudentView;

  if (!hasDirectRole && !hasImpersonatedRole) {
    return <Navigate to="/profile-dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
