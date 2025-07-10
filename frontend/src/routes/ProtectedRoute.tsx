import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

interface Props {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>; // usar fragment por si son múltiples nodos
};

export default ProtectedRoute;
