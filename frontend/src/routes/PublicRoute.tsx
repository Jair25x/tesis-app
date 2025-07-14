import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import type { JSX } from "react";

interface Props {
  children: JSX.Element;
}

const PublicRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Si ya está autenticado, lo redirigimos al Home o Dashboard
  if (isAuthenticated) {
    return <Navigate to="/profile-dashboard" replace />;
  }

  return children;
};

export default PublicRoute;