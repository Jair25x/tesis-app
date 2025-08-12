import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Toaster } from "react-hot-toast";

import { CurriculumProvider } from "./context/CurriculumProvider";
import { CompetencyProvider } from "./context/CompetencyProvider";
import { WhiteboardProvider } from "./context/WhiteboardProvider";
import { AuthProvider } from "./context/AuthProvider";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000, // 1 min: evita refetch inmediato
      gcTime: 5 * 60_000, // 5 min en cache
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <CurriculumProvider>
        <CompetencyProvider>
          <WhiteboardProvider>
            <QueryClientProvider client={queryClient}>
              <App />
              <Toaster
                toastOptions={{
                  duration: 4000,
                  style: {
                    borderRadius: "12px",
                    background: "#333",
                    color: "#fff",
                  },
                  success: {
                    iconTheme: { primary: "#10b981", secondary: "#fff" },
                  },
                  error: {
                    iconTheme: { primary: "#ef4444", secondary: "#fff" },
                  },
                }}
              />
            </QueryClientProvider>
          </WhiteboardProvider>
        </CompetencyProvider>
      </CurriculumProvider>
    </AuthProvider>
  </React.StrictMode>
);
