// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Toaster } from "react-hot-toast";
import { WhiteboardProvider } from "./context/WhiteboardProvider";
import { AuthProvider } from "./context/AuthProvider";
import {
  QueryClient,
  QueryClientProvider,
  type QueryCacheNotifyEvent,
} from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { showToast } from "./utils/showToast";
import { initMonitoring } from "./utils/monitoring";
import type { AxiosError } from "axios";

initMonitoring();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        const msg =
          (typeof error === "object" &&
            error !== null &&
            "message" in error &&
            typeof (error as { message?: string }).message === "string" &&
            (error as { message?: string }).message) ||
          "";

        if (msg.includes("401") || msg.includes("403")) return false;
        return failureCount < 2;
      },
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: true,
      throwOnError: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Helpers de tipado para extraer mensajes sin usar "any"
function isAxiosError(
  e: unknown
): e is AxiosError<{ message?: string; error?: string }> {
  return typeof e === "object" && e !== null && "isAxiosError" in e;
}

function toErrorMessage(e: unknown): string | null {
  if (!e) return null;
  if (typeof e === "string") return e;

  if (isAxiosError(e)) {
    const data = e.response?.data;
    if (data && typeof data === "object") {
      const m =
        (data as { message?: string }).message ??
        (data as { error?: string }).error;
      if (typeof m === "string" && m.trim()) return m;
    }
    if (e.message) return e.message;
  }

  if (e instanceof Error) return e.message;

  if (typeof e === "object" && "message" in (e as Record<string, unknown>)) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }

  return null;
}

// Suscripción de errores (API v5): mirar event.type === "updated" y query.state
queryClient.getQueryCache().subscribe((event: QueryCacheNotifyEvent) => {
  if (event?.type !== "updated") return;

  const q = event.query;
  const state = q.state;

  if (state.status === "error") {
    const msg = toErrorMessage(state.error);
    if (msg) showToast.error(msg);
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
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

      {/* {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />} */}
    </QueryClientProvider>
  </React.StrictMode>
);
