import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";


interface Props { children: ReactNode; }

const ProtectedRoute = ({ children }: Props) => {
  const { isAuthenticated } = useAuth();
  // Si tu useAuth expone "loading", podrías usarlo aquí.
  // En este diseño, AuthProvider bloquea con <LoadingScreen/>, así que esto basta.

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;