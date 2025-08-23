// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Toaster } from "react-hot-toast";
import { WhiteboardProvider } from "./context/WhiteboardProvider";
import { AuthProvider } from "./context/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools"; // opcional en dev

// Ajustes sensatos de producción (puedes retocar a gusto)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000, // 1 min: si quieres menos tráfico al BE, sube a 5 min (300_000)
      gcTime: 5 * 60_000, // 5 min
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* IMPORTANTE: React Query debe envolver a AuthProvider */}
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WhiteboardProvider>
          <App />
          <Toaster
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "12px",
                background: "#333",
                color: "#fff",
              },
              success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
        </WhiteboardProvider>
      </AuthProvider>

      {/* Solo en desarrollo: */}
      {/* {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />} */}
    </QueryClientProvider>
  </React.StrictMode>
);
