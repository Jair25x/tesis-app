import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Toaster } from "react-hot-toast";
import { CurriculumProvider } from "./context/CurriculumProvider";
import { CompetencyProvider } from "./context/CompetencyProvider"; // ✅ NUEVO

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CurriculumProvider>
      <CompetencyProvider>
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
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </CompetencyProvider>
    </CurriculumProvider>
  </React.StrictMode>
);
