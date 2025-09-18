// src/App.tsx
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/AppRoutes";
import { useTheme } from "./hooks/useTheme";
import AppErrorBoundary from "./components/AppErrorBoundary";

export default function App() {
  useTheme();
  return (
    <AppErrorBoundary>
      <RouterProvider router={router} />
    </AppErrorBoundary>
  );
}
