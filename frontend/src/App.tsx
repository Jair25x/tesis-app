// src/App.tsx
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { router } from "./routes/AppRoutes";
import { useTheme } from "./hooks/useTheme";

export default function App() {
  useTheme(); // Aplica el tema antes de renderizar
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
