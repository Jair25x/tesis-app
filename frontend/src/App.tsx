// src/App.tsx
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/AppRoutes";
import { useTheme } from "./hooks/useTheme";

export default function App() {
  // opcional: mantiene sincronía con el script de index.html
  useTheme();
  return <RouterProvider router={router} />;
}
